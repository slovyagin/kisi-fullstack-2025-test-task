export type TrackedEvent = {
	uuid: string;
	actor_type: string;
	actor_id: string;
	actor_name: string;
	actor_email: string;
	action: string;
	authenticated_by_type: string;
	authenticated_by_id: string;
	object_type: string;
	object_id: number;
	object_name: string;
	success: boolean;
	code: string;
	message: string;
	created_at: Date;
}

export type Heatmap = {
	date: string;
	hours: number[];
}[]
