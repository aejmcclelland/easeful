// Navbar component using DaisyUI v5 + Next.js App Router
import Image from 'next/image';
import Link from 'next/link';

export default function Navbar() {
  return (
    <div className="navbar bg-primary text-primary-content sticky top-0 z-50 shadow-sm">
      {/* Left: Brand + Mobile menu toggle */}
      <div className="navbar-start">
        {/* Mobile hamburger */}
        <div className="dropdown lg:hidden">
          <div tabIndex={0} role="button" aria-label="Open menu" className="btn btn-ghost btn-square">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 w-56 rounded-box bg-base-100 text-base-content p-2 shadow"
          >
            <li><Link href="/">Home</Link></li>
            <li><Link href="/features">Features</Link></li>
            <li><Link href="/pricing">Pricing</Link></li>
          </ul>
        </div>

        <Link href="/" className="btn btn-ghost text-xl normal-case">Easeful</Link>
      </div>

      {/* Center: Desktop menu */}
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li><Link href="/">Home</Link></li>
          <li><Link href="/features">Features</Link></li>
          <li><Link href="/pricing">Pricing</Link></li>
        </ul>
      </div>

      {/* Right: Avatar dropdown */}
      <div className="navbar-end">
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar" aria-label="Open profile menu">
            <div className="w-10 rounded-full ring ring-primary-content/30 ring-offset-2 ring-offset-primary">
              <Image
                width={40}
                height={40}
                className="rounded-full"
                alt="User avatar"
                src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
              />
            </div>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content mt-3 w-52 rounded-box bg-base-100 text-base-content p-2 shadow z-10"
          >
            <li>
              <Link href="/profile" className="justify-between">
                Profile
                <span className="badge badge-primary">New</span>
              </Link>
            </li>
            <li><Link href="/settings">Settings</Link></li>
            <li><button>Logout</button></li>
          </ul>
        </div>
      </div>
    </div>
  );
}
