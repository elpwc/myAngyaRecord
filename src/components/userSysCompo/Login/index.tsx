import { Formik, Form, Field } from 'formik';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import { userInfoStorage } from '../../../globalStorages';
import { c_autoLogin, c_pw, c_token, c_uid, c_userName, c_userNickName } from '../../../utils/cookies';
import './index.css';
import { loginUser } from '../../../utils/userUtils';

interface P {}

export default (props: P) => {
  const params = useParams();
  const navigate = useNavigate();
  const mylocation = useLocation();

  // let currentId: string = params.id as string;

  const defaultValues = {
    name: '',
    password: '',
    autoLogin: true,
  };

  const [initialValues, setinitialValues]: [any, any] = useState(defaultValues);
  const [buttonAvailable, setbuttonAvailable]: [boolean, any] = useState(true);
  const [tip, settip]: [string, any] = useState('');

  useEffect(() => {
    document.title = 'My行脚記録 - ログイン';
  }, []);

  return (
    <div className="login-container">
      <Formik
        enableReinitialize
        initialValues={initialValues}
        onSubmit={async (values, { resetForm }) => {
          setbuttonAvailable(false);
          if (values.password !== '') {
            if (values.email !== '') {
              loginUser({ email: values.email, password: values.password })
                .then(e => {
                  setbuttonAvailable(true);
                  const res = e.res;
                  switch (res) {
                    case 'ok':
                      const token = e.token;
                      const email = e.email;
                      const nickname = e.nickname;
                      const uid = e.uid;

                      c_token(token);
                      c_userName(email);
                      c_userNickName(nickname);
                      c_uid(uid);

                      if (values.autoLogin) {
                        c_autoLogin(true);
                        c_pw(values.password);
                      } else {
                        c_autoLogin(false);
                        c_pw('');
                      }

                      resetForm();
                      settip('成功');
                      navigate('/');

                      break;
                    case 'fail':
                      settip('入力したメールが存在しません。或いはパスワードが違います');
                      break;
                    default:
                      settip('エラー');
                      break;
                  }
                })
                .catch(e => {
                  setbuttonAvailable(true);
                  console.log(e);
                });
            } else {
              settip('メールを入力してください');
            }
          } else {
            settip('パスワードを入力してください!');
          }
        }}
      >
        {({ values }) => (
          <Form className="login-form">
            <label className="login-form-item-container">
              <Field id="email" name="email" className="login-input" placeholder="メール" />
            </label>

            <label className="login-form-item-container">
              <Field type="password" id="password" name="password" className="login-input" placeholder="パスワード" />
            </label>

            <div className="login-form-item-container">
              <label className="login-form-checkbox-container">
                <Field type="checkbox" name="autoLogin" className="auto-login-checkbox" />
                <span className="auto-login-label">次回からオートログイン</span>
              </label>
            </div>

            <div className="login-form-item-container">
              <button type="submit" className="retro-button login-button" disabled={!buttonAvailable}>
                ログイン
              </button>
              <div className="login-tip">{tip}</div>
            </div>
            <div className="login-form-item-container login-form-footer-buttons-container">
              <Link className="login-form-footer-link" to="/emailverify">
                アカウント作成
              </Link>
              <Link className="login-form-footer-link" to={'/emailverify?email=' + values.email + '&forgetpassword=1'}>
                パスワード忘れた
              </Link>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};
