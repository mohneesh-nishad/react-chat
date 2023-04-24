import React, { useState } from 'react';
import './styles.css';
import axios from 'axios';
export const BASE_URL = 'http://localhost:3000';

function SignIn(props) {
  // React States
  console.log(props.socket);
  const [errorMessages, setErrorMessages] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [state, setState] = useState({ email: '', password: '' });

  const errors = {
    email: 'invalid username',
    password: 'invalid password',
    failed: 'failed to login',
  };

  function handleInput(e) {
    e.preventDefault();
    if (e.target.value) {
      setState({ ...state, [e.target.name]: e.target.value });
    }
  }

  const handleSubmit = async (event) => {
    //Prevent page reload
    event.preventDefault();

    // const { email, password } = document.forms[0];
    console.log(state);
    const deviceId = props.socket?.id;
    // Find user login info
    // const userData = database.find((user) => user.username === email.value);
    const { data, status } = await axios.post(BASE_URL + '/auth/v2/sign-in', { email: state.email, password: state.password });
    console.log({ data });
    // Compare user info
    if (status === 200) {
      setIsSubmitted(true);
    } else {
      // Username not found
      setErrorMessages({ name: 'failed', message: errors.failed });
    }
  };

  // Generate JSX code for error message
  const renderErrorMessage = (name) => name === errorMessages.name && <div className='error'>{errorMessages.message}</div>;

  // JSX code for login form
  const renderForm = (
    <div className='form'>
      <form onSubmit={handleSubmit}>
        <div className='input-container'>
          <label>Username </label>
          <input type='text' name='email' required onChange={handleInput} />
          {renderErrorMessage('email')}
        </div>
        <div className='input-container'>
          <label>Password </label>
          <input type='password' name='password' required onChange={handleInput} />
          {renderErrorMessage('password')}
        </div>
        <div className='button-container'>
          <input type='submit' />
        </div>
      </form>
    </div>
  );

  return (
    <div className='SignIn'>
      <div className='login-form'>
        <div className='title'>Sign In</div>
        {isSubmitted ? <div>User is successfully logged in</div> : renderForm}
      </div>
    </div>
  );
}

export default SignIn;
