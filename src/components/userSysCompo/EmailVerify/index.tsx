import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router';
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
  //const [searchParams] = useSearchParams();

  // let currentId: string = params.id as string;

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
    defaultValues.email = acc ?? '';
  }, [mylocation.search]);

  const verifyEmail = async ({ email, token }: { email: string; token: string }) => {
    return request<any>('/user/mail.php', {
      method: 'POST',
      data: { email, token, isForgetPassword: new URLSearchParams(mylocation.search).get('forgetpassword') === '1' ? 1 : 0 },
      timeout: 20000,
    });
  };

  useEffect(() => {
    document.title = 'My行脚記録 - メール認証';
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
                      settip('認証メールを発送しました、ご確認ください');
                      setTimeout(() => {
                        sethasRequestSend(true);
                      }, 1000);
                      //navigate('/login');
                      break;
                    case 'exist':
                      settip('メールが既に存在しています');
                      break;
                    case 'email_not_exist':
                      settip('メールが存在しない');
                      break;
                    case 'recaptcha_failed':
                      settip('reCAPTCHA認証失敗');
                      break;
                    case 'email_failed':
                      settip('認証メール発送失敗しました、もう一度試してください');
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
              settip('reCAPTCHA認証は未完成');
            }
          } else {
            settip('メールを入力してください');
          }
        }}
      >
        {({ values }) => (
          <Form className="login-form">
            {hasRequestSend ? (
              <p>認証メール発送しました。ご確認ください</p>
            ) : (
              <>
                <label className="login-form-item-container">
                  <Field type="email" id="email" name="email" className="login-input" placeholder="Email" />
                </label>
                <div>
                  {recaptchaLoading && <div className="login-tip">reCAPTCHA Loading...</div>}
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
                <div className="login-form-item-container">
                  <button type="submit" className="retro-button login-button" disabled={!buttonAvailable}>
                    認証メール発送
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
