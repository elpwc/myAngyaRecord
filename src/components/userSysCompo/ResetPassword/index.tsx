import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import './index.css';
import { Field, Form, Formik } from 'formik';
import { resetPassword } from '../../../utils/userUtils';
import { c_token, c_userName } from '../../../utils/cookies';
import { getGlobalState } from '../../../utils/globalStore';

interface P {}

export default (props: P) => {
  const params = useParams();
  const navigate = useNavigate();
  const mylocation = useLocation();

  // let currentId: string = params.id as string;

  const defaultValues = {
    password: '',
    password2: '',
  };

  const [initialValues, setinitialValues]: [any, any] = useState(defaultValues);
  const [buttonAvailable, setbuttonAvailable]: [boolean, any] = useState(true);
  const [tip, settip]: [string, any] = useState('');
  const [hasRequestSend, sethasRequestSend]: [boolean, any] = useState(false);

  const [email, setemail] = useState('');
  //const [token, settoken] = useState('');

  useEffect(() => {
    const queryParams = new URLSearchParams(mylocation.search);
    const email_q = queryParams.get('acc');
    const token_q = queryParams.get('v');
    if (email_q) {
      if (email_q !== '') {
        c_userName(getGlobalState().loginUserInfo.id, email_q);
        setemail(email_q);
      } else {
        setemail(c_userName(getGlobalState().loginUserInfo.id));
      }
    } else {
      setemail(c_userName(getGlobalState().loginUserInfo.id));
    }
    if (token_q) {
      if (token_q !== '') {
        c_token(getGlobalState().loginUserInfo.id, token_q);
        //settoken(token_q);
      } else {
        //settoken(c_token(getGlobalState().loginUserInfo.id));
      }
    } else {
      //settoken(c_token(getGlobalState().loginUserInfo.id));
    }
  }, [mylocation.search]);

  useEffect(() => {
    document.title = 'My行脚記録 - パスワード再設定';
  }, []);

  return (
    <div className="register-container">
      <Formik
        enableReinitialize
        initialValues={initialValues}
        onSubmit={async (values, { resetForm }) => {
          setbuttonAvailable(false);
          if (values.password !== '' && values.password === values.password2) {
            resetPassword({ email: email, pw: values.password })
              .then(e => {
                setbuttonAvailable(true);
                const res = e.res;
                switch (res) {
                  case 'ok':
                    resetForm();
                    settip('成功');
                    setTimeout(() => {
                      sethasRequestSend(true);
                    }, 1000);
                    break;
                  default:
                    settip('エラー');
                    break;
                }
              })
              .catch(e => {
                setbuttonAvailable(true);
              });
          } else {
            settip('再入力したパスワードが一致しません');
          }
        }}
      >
        {({ values }) => (
          <Form className="login-form">
            <label className="login-form-item-container">{email}</label>
            {hasRequestSend ? (
              <p>再設定完了</p>
            ) : (
              <>
                <label className="login-form-item-container">
                  <Field type="password" id="password" name="password" className="register-input" placeholder="パスワード" />
                </label>
                <label className="login-form-item-container">
                  <Field type="password" id="password2" name="password2" className="register-input" placeholder="同じパスワード再入力" />
                </label>
                <div className="login-form-item-container">
                  <button type="submit" className="retro-button login-button" disabled={!buttonAvailable}>
                    パスワード再設定
                  </button>
                  <div className="login-tip">{tip}</div>
                  <Link className="login-form-footer-link" to="/login">
                    ログイン
                  </Link>
                </div>
              </>
            )}
          </Form>
        )}
      </Formik>
    </div>
  );
};
