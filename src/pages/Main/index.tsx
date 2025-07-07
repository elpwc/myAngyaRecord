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

  // let currentId: string = params.id as string;
  const [currentLocation, setcurrentLocation] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  const menuItems = [
    { title: '日本', link: '/japan', disabled: false },
    { title: '沼津', link: '/numazu', disabled: false },
    { title: '中国本土', link: '/mainlandchina', disabled: true },
    { title: '台湾', link: '/taiwan', disabled: true },
    { title: '韓国', link: '/korea', disabled: true },
    { title: 'ベトナム', link: '/vietnam', disabled: true },
    { title: '香港', link: '/hongkong', disabled: true },
  ];

  useEffect(() => {
    // document.title = '';
    if (isLogin()) {
      loginCurrentUser();
    }

    for (let i = 0; i < menuItems.length; i++) {
      if (menuItems[i].link === mylocation.pathname) {
        setcurrentLocation(i);
      }
    }
  }, []);

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
                <div key={menuItem.title} className={`regionMenuItem ${menuItem.disabled ? 'regionMenuItem-disabled ' : ''}  ${index === currentLocation ? 'selected' : ''}`}>
                  <Link
                    className={`regionMenuLink ${menuItem.disabled ? 'regionMenuLink-disabled ' : ''}`}
                    to={menuItem.link}
                    aria-disabled={menuItem.disabled}
                    onClick={e => {
                      if (!menuItem.disabled) {
                        setcurrentLocation(index);
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
              <Link to={'/ranking' + menuItems[currentLocation].link}>ランキング</Link>
              {isLogin() ? (
                <>
                  <Link to="/user">
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
              <Link to="/about">ﾌｨｰﾄﾞﾊﾞｯｸ</Link>
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
                  {menuItems[currentLocation].title}
                </button>
                {showDropdown && (
                  <div className="dropDownMenu">
                    {menuItems.map((menuItem, index) => (
                      <button
                        key={menuItem.title}
                        className={`dropDownMenu-item${menuItem.disabled ? ' disabled' : ''}${index === currentLocation ? ' selected' : ''}`}
                        style={{
                          cursor: menuItem.disabled ? 'not-allowed' : 'pointer',
                          color: menuItem.disabled ? '#aaa' : 'white',
                          fontWeight: index === currentLocation ? 'bold' : 'normal',
                        }}
                        disabled={menuItem.disabled}
                        onClick={() => {
                          if (!menuItem.disabled) {
                            setcurrentLocation(index);
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
              <Link to="/ranking">ランキング</Link>
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
