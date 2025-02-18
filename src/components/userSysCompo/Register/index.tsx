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
    document.title = 'Otogemap - Register';
  }, []);

  return (
    <div className="register-container">
      <Formik
        enableReinitialize
        initialValues={initialValues}
        onSubmit={async (values, { resetForm }) => {
          setbuttonAvailable(false);
          if (values.password !== '' && values.password === values.password2) {
            if (values.name !== '') {
              createUser({ email: email, password: values.password, name: values.name, token: verifycode })
                .then(e => {
                  const res = e.res;
                  setbuttonAvailable(true);
                  switch (res) {
                    case 'ok':
                      resetForm();
                      settip('作成完了Nya♡');
                      setTimeout(() => {
                        sethasRequestSend(true);

                        navigate('/login');
                      }, 1000);
                      break;
                    case 'exist':
                      settip('EMAIL既存在');
                      break;
                    case 'email_verify_failed':
                      settip('認証失敗');
                      break;
                    case 'database_error':
                      settip('DATABASE書込失敗');
                      break;
                    default:
                      settip('ERROR');
                      break;
                  }
                })
                .catch(e => {
                  setbuttonAvailable(true);
                });
            } else {
              settip('Nickname入力！');
            }
          } else {
            settip('Password不一致');
          }
        }}
      >
        {({ values }) => (
          <Form className="register-form">
            <div className="register-form-item-container">
              <p>{email}</p>
            </div>
            <label className="register-form-item-container">
              <Field type="password" id="password" name="password" className="register-input" placeholder="Password" />
            </label>
            <label className="register-form-item-container">
              <Field type="password" id="password2" name="password2" className="register-input" placeholder="Password二回目" />
            </label>
            <label className="register-form-item-container">
              <Field id="name" name="name" className="register-input" placeholder="Nickname" />
            </label>
            <div className="register-form-item-container">
              <button type="submit" className="retro-button register-button" disabled={!buttonAvailable}>
                ACCOUNT作成
              </button>
              <div className="register-tip">{tip}</div>
              <Link to="/login">LOGIN</Link>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};
