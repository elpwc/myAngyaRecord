import React, { useState } from 'react';
import { useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate, useParams } from 'react-router';
import './index.css';
import { isLogin, loginCurrentUser, logout } from '../../utils/userUtils';
import { c_userName } from '../../utils/cookies';
import { useIsMobile } from '../../utils/hooks';

interface P {
  onMobileMenuClick: () => void;
}

export default (props: P) => {
  const params = useParams();
  const navigate = useNavigate();
  const mylocation = useLocation();
  const isMobile = useIsMobile();

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
    // document.title = '';
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
            <div id="title">My行脚記録</div>

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
                ランキング
              </Link>

              {isLogin() ? (
                <>
                  <Link to="/user" className={currentLocation === 'user' ? 'selected' : ''}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
                      </svg>
                      <span>{c_userName()}</span>
                    </span>
                  </Link>
                  <Link
                    to="/"
                    onClick={() => {
                      logout();
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
              <Link to="/about" className={currentLocation === 'about' ? 'selected' : ''}>
                ﾌｨｰﾄﾞﾊﾞｯｸ
              </Link>
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
              <div id="title">My行脚記録</div>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <button className="header-menu-button" onClick={() => setShowDropdown(prev => !prev)}>
                  {menuItems[currentMap === -1 ? 0 : currentMap].title}
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
                  </svg>
                </button>
                {showDropdown && (
                  <div className="dropDownMenu">
                    {menuItems.map((menuItem, index) => (
                      <button
                        key={menuItem.title}
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
                          }
                        }}
                      >
                        {menuItem.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </menu>

            <menu className="rightMenu">
              <Link to={'/ranking' + menuItems[currentMap === -1 ? 0 : currentMap].link} className={currentLocation === 'ranking' ? 'selected' : ''}>
                ランキング
              </Link>
              {isLogin() ? (
                <button className="header-menu-button">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
                  </svg>
                </button>
              ) : (
                <>
                  <Link to="/emailverify">新規アカウント</Link>
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
