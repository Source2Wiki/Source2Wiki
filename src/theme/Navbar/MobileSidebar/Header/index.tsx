import React, { type ReactNode } from 'react';
import { useNavbarMobileSidebar } from '@docusaurus/theme-common/internal';
import { translate } from '@docusaurus/Translate';
import NavbarColorModeToggle from '@theme/Navbar/ColorModeToggle';
import IconClose from '@theme/Icon/Close';
import NavbarLogo from '@theme/Navbar/Logo';
import clsx from 'clsx';
import styles from './styles.module.css';

function CloseButton() {
  const mobileSidebar = useNavbarMobileSidebar();
  return (
    <button
      type="button"
      aria-label={translate({
        id: 'theme.docs.sidebar.closeSidebarButtonAriaLabel',
        message: 'Close navigation bar',
        description: 'The ARIA label for close button of mobile sidebar',
      })}
      className="clean-btn navbar-sidebar__close"
      onClick={() => mobileSidebar.toggle()}>
      <IconClose color="var(--ifm-color-emphasis-600)" />
    </button>
  );
}

export default function NavbarMobileSidebarHeader(): ReactNode {
  return (
    <div className="navbar-sidebar__brand">
      <NavbarLogo />

      {/* Discord Link */}
      <a
        href="https://discord.gg/W88PUtQKDY"
        className={clsx(styles.sidebarAction)}
        target="_blank"
        rel="noopener noreferrer"
      >
        <svg xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 71 55" className='discord-icon'>
          <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5601 0.39851 45.4675 0.440769 45.4207 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5613 0.525289C25.5145 0.443589 25.4219 0.40133 25.3293 0.41542C20.2555 1.2888 15.4028 2.8186 10.8775 4.8978C10.8384 4.9147 10.8046 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293454 45.3914C0.299005 45.4562 0.335386 45.5182 0.385166 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2073 54.5477 18.3051 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0522 48.4172 21.9934 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1786 45.3021 16.3292 45.2122C16.679 45.004 17.0289 44.7836 17.3616 44.5659C17.4312 44.5199 17.5238 44.5076 17.6011 44.5414C29.2558 49.4152 41.8354 49.4152 53.3196 44.5414C53.3969 44.5049 53.4895 44.5172 53.5625 44.5631C53.8953 44.7808 54.2451 45.004 54.5968 45.2122C54.7474 45.3021 54.7396 45.5041 54.5996 45.5858C52.8309 46.6197 50.9922 47.4931 49.0594 48.2228C48.9336 48.2707 48.8776 48.4172 48.9391 48.5383C49.999 50.6036 51.2164 52.5692 52.5552 54.4342C52.6103 54.5139 52.7108 54.5477 52.8034 54.5195C58.593 52.7249 64.4756 50.0174 70.5491 45.5576C70.6026 45.5182 70.6372 45.459 70.6427 45.3942C72.1747 29.0986 67.2147 15.7752 60.1968 4.9823C60.1775 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.937 34.1136 40.937 30.1693C40.937 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z"
            fill="currentColor" />
        </svg>
      </a>

      {/* Github Link */}
      <a
        href="https://github.com/Source2Wiki/Source2Wiki"
        className={clsx(styles.sidebarAction)}
        target="_blank"
        rel="noopener noreferrer"
      >
        <svg xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
            fill="currentColor" />
        </svg>
      </a>

      {/* Color Mode Button */}
      <NavbarColorModeToggle className="margin-right--md" />
      <CloseButton />
    </div>
  );
}
