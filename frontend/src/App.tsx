import { Route, Routes } from 'react-router-dom';
import Index from './pages/auth/Index';
import ResetPass from './pages/auth/ResetPass';
import NotesIndex from './pages/notes/Index';
import NoteDetails from './pages/notes/NoteDetails';
import Setting from './pages/notes/Setting';
import Upload from './pages/notes/Upload';
import UserList from './pages/admin/UserList';
import ContactList from './pages/admin/ContactList';
import PageNotFound from './pages/PageNotFound';
import ContactPage from './pages/contact/Index';
import Register from './components/auths/RegisterForm';

import UserLayout from './pages/layouts/UserLayout';
import AdminLayout from './pages/layouts/AdminLayout';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/register" element={<Register />} />
      <Route path="/resetPass" element={<ResetPass />} />
      <Route path="/notes" element={<UserLayout />}>
        <Route index element={<NotesIndex />} />
        <Route path=":userSeqNo" element={<NoteDetails />} />
        <Route path="upload" element={<Upload />} />
        <Route path="setting" element={<Setting />} />
      </Route>

      <Route path="/contact">
        <Route index element={<ContactPage />} />
      </Route>

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<UserList />} />
        <Route path="contactList" element={<ContactList />} />
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
}

export default App;
