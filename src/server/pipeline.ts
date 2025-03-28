export const pipeline = [
  {
    $match: {
      action: "unlock",
      success: true
    }
  },
  {
    $project: {
      date: {$dateToString: {format: "%Y-%m-%d", date: "$created_at"}},
      hour: {$hour: "$created_at"}
    }
  },
  {
    $group: {
      _id: {date: "$date", hour: "$hour"},
      count: {$sum: 1}
    }
  },
  {
    $group: {
      _id: "$_id.date",
      hours: {
        $push: {
          hour: "$_id.hour",
          count: "$count"
        }
      }
    }
  },
  {
    $project: {
      _id: 0,
      date: "$_id",
      hours: {
        $map: {
          input: {$range: [0, 24]},
          as: "hour",
          in: {
            $let: {
              vars: {
                hourData: {
                  $filter: {
                    input: "$hours",
                    cond: {$eq: ["$$this.hour", "$$hour"]}
                  }
                }
              },
              in: {
                $ifNull: [{$arrayElemAt: ["$$hourData.count", 0]}, 0]
              }
            }
          }
        }
      }
    }
  },
  {
    $sort: {date: 1}
  },
  {
    $group: {
      _id: null,
      dates: {$push: "$$ROOT"},
      minDate: {$min: "$date"},
      maxDate: {$max: "$date"}
    }
  },
  {
    $addFields: {
      dateRange: {
        $map: {
          input: {
            $range: [
              0,
              {
                $add: [
                  1,
                  {
                    $dateDiff: {
                      startDate: {$dateFromString: {dateString: "$minDate"}},
                      endDate: {$dateFromString: {dateString: "$maxDate"}},
                      unit: "day"
                    }
                  }
                ]
              }
            ]
          },
          as: "dayOffset",
          in: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: {
                $dateAdd: {
                  startDate: {$dateFromString: {dateString: "$minDate"}},
                  unit: "day",
                  amount: "$$dayOffset"
                }
              }
            }
          }
        }
      }
    }
  },
  {$unwind: "$dateRange"},
  {
    $addFields: {
      existingData: {
        $filter: {
          input: "$dates",
          as: "d",
          cond: {$eq: ["$$d.date", "$dateRange"]}
        }
      }
    }
  },
  {
    $project: {
      _id: 0,
      date: "$dateRange",
      hours: {
        $cond: {
          if: {$gt: [{$size: "$existingData"}, 0]},
          then: {$arrayElemAt: ["$existingData.hours", 0]},
          else: {$map: {input: {$range: [0, 24]}, as: "h", in: 0}}
        }
      }
    }
  },
  {$sort: {date: 1}}
];
