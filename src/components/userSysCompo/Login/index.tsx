import { Formik, Form, Field } from 'formik';
import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import { userInfoStorage } from '../../../globalStorages';
import { c_autoLogin, c_pw, c_token, c_uid, c_userName } from '../../../utils/cookies';
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
    document.title = 'Otogemap - Login';
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
                      const uid = e.uid;

                      c_token(token);
                      c_userName(email);
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
                      settip('EMAIL不存在 or PASSWORD不正、失敗');
                      break;
                    default:
                      settip('ERROR');
                      break;
                  }
                })
                .catch(e => {
                  setbuttonAvailable(true);
                  console.log(e);
                });
            } else {
              settip('Email入力!');
            }
          } else {
            settip('Password入力!');
          }
        }}
      >
        {({ values }) => (
          <Form className="login-form">
            <label className="">
              <Field id="email" name="email" className="login-input" placeholder="Email" />
            </label>

            <label className="">
              <Field type="password" id="password" name="password" className="login-input" placeholder="Password" />
            </label>

            <div className="login-form-item-container">
              <label className="">
                <Field type="checkbox" name="autoLogin" className="auto-login-checkbox" />
                <span className="auto-login-label">次回自動LOGIN</span>
              </label>
            </div>

            <div className="login-form-item-container">
              <button type="submit" className="retro-button login-button" disabled={!buttonAvailable}>
                LOGIN
              </button>
              <div className="login-tip">{tip}</div>
            </div>
            <div className="login-form-item-container login-form-footer-buttons-container">
              <Link to="/emailverify">新Account</Link>
              <Link to={'/emailverify?email=' + values.email + '&forgetpassword=1'}>Password忘却</Link>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};
