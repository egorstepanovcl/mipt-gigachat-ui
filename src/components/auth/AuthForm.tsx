interface AuthFormProps {
  onLogin: () => void;
}

const AuthForm = ({ onLogin }: AuthFormProps) => {
  return (
    <div>
      <p>AuthForm — TODO</p>
      <button onClick={onLogin}>Войти (заглушка)</button>
    </div>
  );
};

export default AuthForm;
