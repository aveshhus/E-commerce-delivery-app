import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ProfileSidebar from '../components/ProfileSidebar';

const ProfileLayout = () => {
    return (
        <div className="profile-container fade-in">
            <ProfileSidebar />
            <div className="profile-content">
                <Outlet />
            </div>
        </div>
    );
};

export default ProfileLayout;
