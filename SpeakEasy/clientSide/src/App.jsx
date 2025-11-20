import React from "react";
import Nav from "./Components/website/Nav";
import Index from "./Components/website/Index";
import { Route, Routes } from "react-router-dom";
import About from "./Components/website/about";
import Contact from "./Components/website/Contact";
import Services from "./Components/website/Services";
import Login from "./Components/Auth/Login";
import Register from "./Components/Auth/Register";
import Listeners from "./Components/website/Listners";
import Chat from "./Components/website/Chats";
import Inbox from "./Components/website/Inbox";
import ProfilePage from "./Components/website/ProfilePage ";
import Chatbot from "./Components/website/Chatbot";
import { ToastContainer } from "react-toastify";
import VerifyEmail from "./Components/Auth/VerifyEmail";
import ProtectedRoutes from "./Components/Auth/ProtectedRoutes";
import BackToTop from "./Components/website/BackToTop";
import Chatboticon from "./Components/website/Chatboticon";
import ForgetPassword from "./Components/Auth/ForgetPassword";
import Messages from "./Components/website/messages";
import Listenerprofile from "./Components/website/Listenerprofile";
import Changepassword from "./Components/website/Changepassword";
import Sidebar from "./Components/Admin Panel/Sidebar";
import AdminLayout from "./Components/Admin Panel/AdminLayout";
import Add_Faq from "./Components/Admin Panel/Add_faq";
import Faqtable from "./Components/Admin Panel/Faqtable";
import EditFaq from "./Components/Admin Panel/EditFaq";
import Categories from "./Components/Admin Panel/Categories";
import Add_categories from "./Components/Admin Panel/Add_categories";
import EditCategory from "./Components/Admin Panel/EditCategory";
import AdminprotectedRoutes from "./Components/Admin Panel/AdminprotectedRoutes";
import ListenersTable from "./Components/Admin Panel/ListenersTable";
import Add_listener from "./Components/Admin Panel/Add_listener";
import SeekerTable from "./Components/Admin Panel/SeekerTable";
import Adminprofile from "./Components/Admin Panel/Adminprofile";
import Admin_changePassword from "./Components/Admin Panel/Admin_changePassword";
import AdminDashborad from "./Components/Admin Panel/AdminDashborad";
import ListnenrsDashboard from "./Components/Listeners Panel/ListnenrsDashboard";
import Listner_Profile from "./Components/Listeners Panel/Listner_Profile";
import Listners_changePassword from "./Components/Listeners Panel/Listners_changePassword";
import Appointment from "./Components/website/Appointment";
import AppointmentDetails from "./Components/Listeners Panel/AppointmentDetails";
import LIsteneerInbox from "./Components/Listeners Panel/LIsteneerInbox";
import ListnenerRoutesprotected from "./Components/Listeners Panel/ListnenerRoutesprotected";
import ContactTable from "./Components/Admin Panel/ContactTable";
import WebFaq from "./Components/website/WebFaq"
import Myappointment from "./Components/website/Myappointment";
const App = () => {
  return (
    <div>
      <Routes>
        <Route element={<AdminprotectedRoutes />}>
          <Route
            path="/admin/dashboard"
            element={<AdminDashborad></AdminDashborad>}
          ></Route>
          <Route path="/Faq_add" element={<Add_Faq />} />
          <Route path="/admin/seekers" element={<SeekerTable />} />
          <Route path="/admin/profile" element={<Adminprofile />} />
          <Route
            path="/admin/Change-password"
            element={<Admin_changePassword />}
          />
          <Route path="/admin/edit_faq/:id" element={<EditFaq />} />
          <Route path="/admin/Categories" element={<Categories />} />
          <Route path="/admin/add_categories" element={<Add_categories />} />
  <Route path="/admin/contact" element={<ContactTable />} />
          <Route path="/admin/edit_cate/:id" element={<EditCategory />} />
          <Route path="/faq" element={<Faqtable />} />

          <Route path="/admin/listenerTable" element={<ListenersTable />} />
          <Route path="/admin/add-listener" element={<Add_listener />} />
        </Route>
        <Route path="/" element={<Index></Index>}></Route>
        <Route path="/about" element={<About></About>}></Route>
        <Route path="/contact" element={<Contact></Contact>}></Route>
        <Route path="/service" element={<Services></Services>}></Route>
        <Route path="/login" element={<Login></Login>}></Route>
        <Route path="/register" element={<Register></Register>}></Route>
        <Route path="/listners" element={<Listeners></Listeners>}></Route>
            <Route path="/web/faq" element={<WebFaq />} />
        <Route
          path="/listners/:id"
          element={<Listenerprofile></Listenerprofile>}
        ></Route>
        <Route path="/chat/:sessionId" element={<Chat />} />
        <Route path="/inbox" element={<Inbox />} />
        {/* <Route path="/profile/:id" element={<ProfilePage />} /> */}
        <Route path="/gemini" element={<Chatbot />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forget-password" element={<ForgetPassword />} />
        {/* <Route path="/msg" element={<Messages />} /> */}
        <Route element={<ProtectedRoutes />}>
          <Route path="/web/appointments" element={<Appointment />}></Route>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/chats" element={<Messages />} />
          <Route path="/change-password" element={<Changepassword />} />
          <Route path="/web/myappoint"element={<Myappointment></Myappointment>}></Route>
        </Route>

        {/* listners Dashboard */}
        <Route element={<ListnenerRoutesprotected />}>
          <Route
            path="/listener/Dashboard"
            element={<ListnenrsDashboard />}
          ></Route>
          <Route
            path="/listener/Listner_profile"
            element={<Listner_Profile />}
          ></Route>
          <Route
            path="/listener/ChangePassword"
            element={<Listners_changePassword />}
          ></Route>

          <Route
            path="/Listener/appoinments"
            element={<AppointmentDetails />}
          ></Route>
          <Route path="/Listener/msg" element={<LIsteneerInbox />}></Route>
        </Route>
      </Routes>
      <ToastContainer />
    </div>
  );
};

export default App;
