import React, { useState } from 'react';
import { useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate, useParams } from 'react-router';
import './index.css';
import { isLogin, loginCurrentUser, logout } from '../../utils/userUtils';
import { useIsMobile } from '../../utils/hooks';
import { motion, AnimatePresence } from 'framer-motion';
import { useHint } from '../../components/InfrastructureCompo/HintProvider';
import { c_uid, c_userNickName } from '../../utils/cookies';

interface P {
  onMobileMenuClick: () => void;
}

export default (props: P) => {
  const params = useParams();
  const navigate = useNavigate();
  const mylocation = useLocation();
  const isMobile = useIsMobile();
  const hint = useHint();

  type Location = 'ranking' | 'user' | 'about' | '';

  // let currentId: string = params.id as string;
  const [currentMap, setcurrentMap] = useState(-1);
  const [currentLocation, setcurrentLocation] = useState<Location>('');
  const [showDropdown, setShowDropdown] = useState(false);

  const menuItems = [
    { title: '日本', link: '/japan', disabled: false },
    { title: '沼津', link: '/numazu', disabled: false },
    { title: '中国本土', link: '/mainlandchina', disabled: true },
    { title: '台湾', link: '/taiwan', disabled: true },
    { title: '韓国', link: '/korea', disabled: true },
    { title: 'ベトナム', link: '/vietnam', disabled: false },
    { title: '香港', link: '/hongkong', disabled: true },
  ];

  useEffect(() => {
    switch (currentLocation) {
      case 'ranking':
        document.title = 'My行脚記録 - ' + (currentMap === -1 ? '日本' : menuItems[currentMap].title) + 'ランキング';
        break;
      case 'user':
        document.title = 'My行脚記録 - ユーザー';
        break;
      case 'about':
        document.title = 'My行脚記録 - このサイトについて';
        break;
      default:
        document.title = 'My行脚記録 - ' + (currentMap === -1 ? '日本' : menuItems[currentMap].title);
        break;
    }
  }, [currentLocation, currentMap]);

  useEffect(() => {
    if (isLogin()) {
      loginCurrentUser();
    }

    let currentMapPath = mylocation.pathname.toLowerCase();
    const routes = mylocation.pathname.split('/');
    switch (routes[1].toLowerCase()) {
      case 'ranking':
        setcurrentLocation('ranking');
        if (routes[2]) {
          currentMapPath = '/' + routes[2].toLowerCase();
        }
        break;
      case 'user':
      case 'about':
        setcurrentLocation(routes[1].toLowerCase() as Location);
        setcurrentMap(-1);
        break;
      default:
        break;
    }
    for (let i = 0; i < menuItems.length; i++) {
      if (menuItems[i].link === currentMapPath) {
        setcurrentMap(i);
      }
    }
  }, [mylocation]);

  return (
    <>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'grid',
          gridTemplateRows: 'auto 1fr',
        }}
      >
        {!isMobile ? (
          <header>
            <Link to={'/japan'} className={'regionMenuLink'}>
              <div id="title">My行脚記録</div>
            </Link>

            <menu id="regionMenu">
              {menuItems.map((menuItem, index) => (
                <div key={menuItem.title} className={`regionMenuItem ${menuItem.disabled ? 'regionMenuItem-disabled ' : ''}  ${index === currentMap ? 'selected' : ''}`}>
                  <Link
                    className={`regionMenuLink ${menuItem.disabled ? 'regionMenuLink-disabled ' : ''}`}
                    to={menuItem.link}
                    aria-disabled={menuItem.disabled}
                    onClick={e => {
                      if (!menuItem.disabled) {
                        setcurrentMap(index);
                        setcurrentLocation('');
                      } else {
                        e.preventDefault();
                      }
                    }}
                  >
                    {menuItem.title}
                  </Link>
                </div>
              ))}
            </menu>

            <menu className="rightMenu">
              <Link to={'/ranking' + menuItems[currentMap === -1 ? 0 : currentMap].link} className={currentLocation === 'ranking' ? 'selected' : ''}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8.67 22.75H2C1.59 22.75 1.25 22.41 1.25 22V16C1.25 14.48 2.48 13.25 4 13.25H8.67C9.08 13.25 9.42 13.59 9.42 14V22C9.42 22.41 9.08 22.75 8.67 22.75ZM2.75 21.25H7.92V14.75H4C3.31 14.75 2.75 15.31 2.75 16V21.25Z" />
                    <path d="M15.3302 22.75H8.66016C8.25016 22.75 7.91016 22.41 7.91016 22V12C7.91016 10.48 9.14016 9.25 10.6602 9.25H13.3302C14.8502 9.25 16.0802 10.48 16.0802 12V22C16.0802 22.41 15.7502 22.75 15.3302 22.75ZM9.42015 21.25H14.5902V12C14.5902 11.31 14.0302 10.75 13.3402 10.75H10.6702C9.98015 10.75 9.42015 11.31 9.42015 12V21.25Z" />
                    <path d="M22.0001 22.75H15.3301C14.9201 22.75 14.5801 22.41 14.5801 22V17C14.5801 16.59 14.9201 16.25 15.3301 16.25H20.0001C21.5201 16.25 22.7501 17.48 22.7501 19V22C22.7501 22.41 22.4101 22.75 22.0001 22.75ZM16.0801 21.25H21.2501V19C21.2501 18.31 20.6901 17.75 20.0001 17.75H16.0801V21.25Z" />
                    <path d="M13.6999 8.34999C13.4599 8.34999 13.1599 8.27997 12.8199 8.07997L11.9999 7.58998L11.1899 8.06999C10.3699 8.55999 9.82989 8.26998 9.62989 8.12998C9.42989 7.98998 8.99989 7.54998 9.20989 6.62998L9.39989 5.79997L8.71989 5.11997C8.29989 4.69997 8.14989 4.19997 8.29989 3.73997C8.44989 3.27997 8.85989 2.95996 9.43989 2.85996L10.3099 2.70997L10.7999 1.72999C11.3399 0.65999 12.6499 0.65999 13.1799 1.72999L13.6699 2.70997L14.5399 2.85996C15.1199 2.95996 15.5399 3.27997 15.6799 3.73997C15.8299 4.19997 15.6699 4.69997 15.2599 5.11997L14.5799 5.79997L14.7699 6.62998C14.9799 7.55998 14.5499 7.98999 14.3499 8.13999C14.2599 8.21999 14.0299 8.34999 13.6999 8.34999ZM11.9999 6.07997C12.2399 6.07997 12.4799 6.13999 12.6799 6.25999L13.2399 6.58998L13.1199 6.04997C13.0199 5.62997 13.1699 5.11998 13.4799 4.80998L13.9899 4.29997L13.3599 4.18998C12.9599 4.11998 12.5699 3.82998 12.3899 3.46998L11.9999 2.71998L11.6199 3.46998C11.4399 3.82998 11.0499 4.11998 10.6499 4.18998L10.0199 4.28999L10.5299 4.79997C10.8399 5.10997 10.9799 5.61999 10.8899 6.03999L10.7699 6.57997L11.3299 6.24998C11.5199 6.12998 11.7599 6.07997 11.9999 6.07997Z" />
                  </svg>
                  ランキング
                </span>
              </Link>

              {isLogin() ? (
                <>
                  <Link to={'/user/' + c_uid()} className={currentLocation === 'user' ? 'selected' : ''}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
                      </svg>
                      <span>{c_userNickName(Number(c_uid()))}</span>
                    </span>
                  </Link>
                  <Link
                    to="/"
                    onClick={() => {
                      logout();
                      hint('bottom', 'ログアウトしました', '#2563eb');
                    }}
                  >
                    ログアウト
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/emailverify">新規アカウント</Link>
                  <Link to="/login">ログイン</Link>
                </>
              )}
            </menu>
          </header>
        ) : (
          <header>
            <menu id="regionMenu">
              <button className="header-menu-button" onClick={props.onMobileMenuClick}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                  <path
                    fillRule="evenodd"
                    d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5"
                  />
                </svg>
              </button>
              <Link to={'/japan'} className={'regionMenuLink'}>
                <div id="title">My行脚記録</div>
              </Link>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <button className="header-menu-button" onClick={() => setShowDropdown(prev => !prev)}>
                  {menuItems[currentMap === -1 ? 0 : currentMap].title}
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
                  </svg>
                </button>
                <AnimatePresence>
                  {showDropdown && (
                    <motion.ul
                      className="dropDownMenu"
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      {menuItems.map((menuItem, index) => (
                        <motion.li style={{ listStyle: 'none' }} key={menuItem.title} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.15 }}>
                          <button
                            className={`dropDownMenu-item${menuItem.disabled ? ' disabled' : ''}${index === (currentMap === -1 ? 0 : currentMap) ? ' selected' : ''}`}
                            style={{
                              cursor: menuItem.disabled ? 'not-allowed' : 'pointer',
                              color: menuItem.disabled ? '#aaa' : 'white',
                              fontWeight: index === (currentMap === -1 ? 0 : currentMap) ? 'bold' : 'normal',
                            }}
                            disabled={menuItem.disabled}
                            onClick={() => {
                              if (!menuItem.disabled) {
                                setcurrentMap(index);
                                setcurrentLocation('');
                                navigate(menuItem.link);
                                setShowDropdown(false);
                                hint('bottom', menuItem.title + '地図に切り替えました', '#2563eb');
                              }
                            }}
                          >
                            {menuItem.title}
                          </button>
                        </motion.li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            </menu>

            <menu className="rightMenu">
              <Link to={'/ranking' + menuItems[currentMap === -1 ? 0 : currentMap].link} className={currentLocation === 'ranking' ? 'selected' : ''}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8.67 22.75H2C1.59 22.75 1.25 22.41 1.25 22V16C1.25 14.48 2.48 13.25 4 13.25H8.67C9.08 13.25 9.42 13.59 9.42 14V22C9.42 22.41 9.08 22.75 8.67 22.75ZM2.75 21.25H7.92V14.75H4C3.31 14.75 2.75 15.31 2.75 16V21.25Z" />
                    <path d="M15.3302 22.75H8.66016C8.25016 22.75 7.91016 22.41 7.91016 22V12C7.91016 10.48 9.14016 9.25 10.6602 9.25H13.3302C14.8502 9.25 16.0802 10.48 16.0802 12V22C16.0802 22.41 15.7502 22.75 15.3302 22.75ZM9.42015 21.25H14.5902V12C14.5902 11.31 14.0302 10.75 13.3402 10.75H10.6702C9.98015 10.75 9.42015 11.31 9.42015 12V21.25Z" />
                    <path d="M22.0001 22.75H15.3301C14.9201 22.75 14.5801 22.41 14.5801 22V17C14.5801 16.59 14.9201 16.25 15.3301 16.25H20.0001C21.5201 16.25 22.7501 17.48 22.7501 19V22C22.7501 22.41 22.4101 22.75 22.0001 22.75ZM16.0801 21.25H21.2501V19C21.2501 18.31 20.6901 17.75 20.0001 17.75H16.0801V21.25Z" />
                    <path d="M13.6999 8.34999C13.4599 8.34999 13.1599 8.27997 12.8199 8.07997L11.9999 7.58998L11.1899 8.06999C10.3699 8.55999 9.82989 8.26998 9.62989 8.12998C9.42989 7.98998 8.99989 7.54998 9.20989 6.62998L9.39989 5.79997L8.71989 5.11997C8.29989 4.69997 8.14989 4.19997 8.29989 3.73997C8.44989 3.27997 8.85989 2.95996 9.43989 2.85996L10.3099 2.70997L10.7999 1.72999C11.3399 0.65999 12.6499 0.65999 13.1799 1.72999L13.6699 2.70997L14.5399 2.85996C15.1199 2.95996 15.5399 3.27997 15.6799 3.73997C15.8299 4.19997 15.6699 4.69997 15.2599 5.11997L14.5799 5.79997L14.7699 6.62998C14.9799 7.55998 14.5499 7.98999 14.3499 8.13999C14.2599 8.21999 14.0299 8.34999 13.6999 8.34999ZM11.9999 6.07997C12.2399 6.07997 12.4799 6.13999 12.6799 6.25999L13.2399 6.58998L13.1199 6.04997C13.0199 5.62997 13.1699 5.11998 13.4799 4.80998L13.9899 4.29997L13.3599 4.18998C12.9599 4.11998 12.5699 3.82998 12.3899 3.46998L11.9999 2.71998L11.6199 3.46998C11.4399 3.82998 11.0499 4.11998 10.6499 4.18998L10.0199 4.28999L10.5299 4.79997C10.8399 5.10997 10.9799 5.61999 10.8899 6.03999L10.7699 6.57997L11.3299 6.24998C11.5199 6.12998 11.7599 6.07997 11.9999 6.07997Z" />
                  </svg>
                </span>
              </Link>
              {isLogin() ? (
                <Link to={'/user/' + c_uid()} className={currentLocation === 'user' ? 'selected' : ''}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
                  </svg>
                </Link>
              ) : (
                <>
                  <Link to="/login">ログイン</Link>
                </>
              )}
            </menu>
          </header>
        )}

        <main>
          <Outlet />
        </main>
      </div>
    </>
  );
};
