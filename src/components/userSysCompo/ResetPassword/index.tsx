import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import './index.css';
import { Field, Form, Formik } from 'formik';
import { resetPassword } from '../../../utils/userUtils';
import { c_token, c_userName } from '../../../utils/cookies';

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
  const [token, settoken] = useState('');

  useEffect(() => {
    const queryParams = new URLSearchParams(mylocation.search);
    const email_q = queryParams.get('acc');
    const token_q = queryParams.get('v');
    if (email_q) {
      if (email_q !== '') {
        c_userName(email_q);
        setemail(email_q);
      } else {
        setemail(c_userName());
      }
    } else {
      setemail(c_userName());
    }
    if (token_q) {
      if (token_q !== '') {
        c_token(token_q);
        settoken(token_q);
      } else {
        settoken(c_token());
      }
    } else {
      settoken(c_token());
    }
  }, [mylocation.search]);

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
                    settip('ERROR');
                    break;
                }
              })
              .catch(e => {
                setbuttonAvailable(true);
              });
          } else {
            settip('Password不一致');
          }
        }}
      >
        {({ values }) => (
          <Form className="register-form">
            <label className="register-form-item-container">{email}</label>
            {hasRequestSend ? (
              <p>RESET完了!</p>
            ) : (
              <>
                <label className="register-form-item-container">
                  <Field type="password" id="password" name="password" className="register-input" placeholder="Password" />
                </label>
                <label className="register-form-item-container">
                  <Field type="password" id="password2" name="password2" className="register-input" placeholder="Password二回目" />
                </label>
                <div className="register-form-item-container">
                  <button type="submit" className="retro-button register-button" disabled={!buttonAvailable}>
                    RESET Password
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
