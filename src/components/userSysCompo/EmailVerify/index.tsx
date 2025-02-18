import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import './index.css';
import ReCaptchaV2 from 'react-google-recaptcha';
import { RECAPTCHA_SITE_KEY } from '../../../global';
import { Field, Form, Formik } from 'formik';
import request from '../../../utils/request';

interface P {}

export default (props: P) => {
  const params = useParams();
  const navigate = useNavigate();
  const mylocation = useLocation();

  // let currentId: string = params.id as string;
  const [email, setemail] = useState('');
  const [isForgetPassword, setisForgetPassword] = useState(false);

  const defaultValues = {
    email: new URLSearchParams(mylocation.search).get('email') ?? '',
  };
  const [recaptchaToken, setrecaptchaToken]: [string | null, any] = useState(null);
  const [initialValues, setinitialValues]: [any, any] = useState(defaultValues);
  const [buttonAvailable, setbuttonAvailable]: [boolean, any] = useState(true);
  const [tip, settip]: [string, any] = useState('');
  const [recaptchaLoading, setrecaptchaLoading]: [boolean, any] = useState(true);
  const [hasRequestSend, sethasRequestSend]: [boolean, any] = useState(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(mylocation.search);
    const acc = queryParams.get('email');
    const f = queryParams.get('forgetpassword');
    if (acc) setemail(acc);
    defaultValues.email = acc ?? '';
    if (f) setisForgetPassword(f === '1' ? true : false);
  }, [mylocation.search]);

  const verifyEmail = async ({ email, token }: { email: string; token: string }) => {
    return request<any>('/user/mail.php', {
      method: 'POST',
      data: { email, token, isForgetPassword: isForgetPassword ? 1 : 0 },
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
          if (values.email !== '') {
            if (recaptchaToken) {
              verifyEmail({ email: values.email, token: recaptchaToken })
                .then(e => {
                  const res = e.res;
                  setbuttonAvailable(true);
                  switch (res) {
                    case 'ok':
                      resetForm();
                      settip('認証MAIL発送成功、確認下');
                      setTimeout(() => {
                        sethasRequestSend(true);
                      }, 1000);
                      //navigate('/login');
                      break;
                    case 'exist':
                      settip('EMAIL既存在');
                      break;
                    case 'email_not_exist':
                      settip('EMAIL不存在');
                      break;
                    case 'recaptcha_failed':
                      settip('reCAPTCHA認証失敗');
                      break;
                    case 'email_failed':
                      settip('認証MAIL発送失敗、再試下');
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
              settip('reCAPTCHA認証未完成');
            }
          } else {
            settip('Email入力！');
          }
        }}
      >
        {({ values }) => (
          <Form className="register-form">
            {hasRequestSend ? (
              <p>認証MAIL発送成功、確認下nya～♡</p>
            ) : (
              <>
                <label className="register-form-item-container">
                  <Field type="email" id="email" name="email" className="register-input" placeholder="Email" />
                </label>
                <div>
                  {recaptchaLoading && <div className="register-tip">reCAPTCHA Loading...</div>}
                  <ReCaptchaV2
                    sitekey={RECAPTCHA_SITE_KEY}
                    onChange={e => {
                      setrecaptchaToken(e);
                    }}
                    onExpired={() => {
                      setrecaptchaToken(null);
                    }}
                    asyncScriptOnLoad={() => {
                      setrecaptchaLoading(false);
                    }}
                  />
                </div>
                <div className="register-form-item-container">
                  <button type="submit" className="retro-button register-button" disabled={!buttonAvailable}>
                    {isForgetPassword ? 'RESET MAIL発送' : 'ACCOUNT作成'}
                  </button>
                  <div className="register-tip">{tip}</div>
                  <Link to="/login">LOGIN</Link>
                </div>
              </>
            )}
          </Form>
        )}
      </Formik>
    </div>
  );
};
