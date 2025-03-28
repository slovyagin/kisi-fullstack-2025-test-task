export function Header() {
  return <header className="bg-brand text-white py-2 px-3 print:hidden">
    <div className="flex items-center gap-3">
      <div className="max-w-6 flex-1">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 58 32" aria-label="Kisi symbol">
          <title lang="en">Kisi symbol</title>
          <g fill="currentColor">
            <path
              d="M57.5979 1.43235V29.9803H29.0499V29.9752C30.0593 25.3791 30.5906 20.6044 30.5906 15.7065C30.5906 10.8074 30.0593 6.03272 29.0499 1.43655V1.43235H57.5979Z"
            />
            <path
              d="M15.2934 31C23.7398 31 30.5869 24.1529 30.5869 15.7065C30.5869 7.2602 23.7398 0.413086 15.2934 0.413086C6.84711 0.413086 0 7.2602 0 15.7065C0 24.1529 6.84711 31 15.2934 31Z"
            />
          </g>
        </svg>
      </div>
      <div>Kisi Inc</div>
    </div>
  </header>
}
