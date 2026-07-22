import { useAuth } from './auth/useAuth';
import Header from './components/Header';
import LoginForm from './components/LoginForm';
import DocumentsPage from './components/DocumentsPage';

export default function App() {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <LoginForm />;
    }

    return (
        <div className="">
            <Header />
            <DocumentsPage />
        </div>
    );
}
