import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import './index.css';
import { Field, Form, Formik } from 'formik';
import request from '../../../utils/request';

interface P {}

export default (props: P) => {
  const params = useParams();
  const navigate = useNavigate();
  const mylocation = useLocation();

  // let currentId: string = params.id as string;

  const defaultValues = {
    name: '',
    password: '',
    password2: '',
  };

  const [initialValues, setinitialValues]: [any, any] = useState(defaultValues);
  const [buttonAvailable, setbuttonAvailable]: [boolean, any] = useState(true);
  const [tip, settip]: [string, any] = useState('');
  const [hasRequestSend, sethasRequestSend]: [boolean, any] = useState(false);
  const [email, setemail] = useState('');
  const [verifycode, setverifycode] = useState('');

  useEffect(() => {
    const queryParams = new URLSearchParams(mylocation.search);
    const acc = queryParams.get('acc');
    const v = queryParams.get('v');
    if (acc) setemail(acc);
    if (v) setverifycode(v);
  }, [mylocation.search]);

  const createUser = async ({ email, name, password, token }: { email: string; name: string; password: string; token: string }) => {
    return request<any>('/user/user.php', {
      method: 'POST',
      data: { email, name, password, token },
    });
  };

  useEffect(() => {
    document.title = 'My行脚記録 - アカウント作成';
  }, []);

  return (
    <div className="register-container">
      <Formik
        enableReinitialize
        initialValues={initialValues}
        onSubmit={async (values, { resetForm }) => {
          if (values.password !== '' && values.password === values.password2) {
            if (values.name !== '') {
              setbuttonAvailable(false);
              createUser({ email: email, password: values.password, name: values.name, token: verifycode })
                .then(e => {
                  const res = e.res;
                  setbuttonAvailable(true);
                  switch (res) {
                    case 'ok':
                      resetForm();
                      settip('作成完了');
                      setTimeout(() => {
                        sethasRequestSend(true);

                        navigate('/login');
                      }, 1000);
                      break;
                    case 'exist':
                      settip('メールは既に存在します');
                      break;
                    case 'email_verify_failed':
                      settip('メール認証失敗');
                      break;
                    case 'database_error':
                      settip('データベース書込失敗');
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
              settip('ニックネームを入力してください');
            }
          } else {
            settip('再入力したパスワードが一致しません');
          }
        }}
      >
        {({ values }) => (
          <Form className="login-form">
            <div className="login-form-item-container">
              <p>{email}</p>
            </div>
            <label className="login-form-item-container">
              <Field type="password" id="password" name="password" className="login-input" placeholder="パスワード" />
            </label>
            <label className="login-form-item-container">
              <Field type="password" id="password2" name="password2" className="login-input" placeholder="同じパスワード再入力" />
            </label>
            <label className="login-form-item-container">
              <Field id="name" name="name" className="login-input" placeholder="ニックネーム" />
            </label>
            <div className="login-form-item-container">
              <button type="submit" className="retro-button login-button" disabled={!buttonAvailable}>
                アカウント作成
              </button>
              <div className="login-tip">{tip}</div>
              <Link className="login-form-footer-link" to="/login">
                ログイン
              </Link>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};
