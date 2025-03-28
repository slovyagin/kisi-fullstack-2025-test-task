export function Sidebar() {
  return <aside className="bg-white min-w-64 p-4 text-xs print:hidden">
    <div className="grid gap-2">
      <div className="uppercase text-blue">Reports</div>
      <ul className="m-0 p-0 grid gap-1">
        {
          [
            {
              title: 'User Export',
              url: '#',
            },
            {
              title: 'User Presence',
              url: '#',
            },
            {
              title: 'Weekly Place Analytics',
              url: '#',
              active: true
            }
          ].map(({title, url, active}) => <li>
            <a
              href={url}
              key={title}
              className={`rounded-lg p-2 block text-brand! hover:bg-blue/10 ${active ? 'bg-blue/20' : ''}`}
            >
              {title}
            </a>
          </li>)
        }
      </ul>
    </div>
  </aside>
}
