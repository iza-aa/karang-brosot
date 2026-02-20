import DesktopNavbar from '../navbar/desktop-navbar';
import MobileNavbar from '../navbar/mobile-navbar';

export default function Header() {
  return (
    <header>
      <DesktopNavbar />
      <MobileNavbar />
    </header>
  );
}