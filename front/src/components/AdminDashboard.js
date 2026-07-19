import React, { useState, useEffect, useMemo } from 'react';
import './AdminDashboard.css';
import Footer from './Footer';
import { uploadImageToImgBB } from './imageUploading';

function AdminDashboard({ user, handleLogout, adminMessages, fetchMessages, newAdminForm, handleNewAdminChange, handleAddAdminSubmit, adminAddStatus, API_BASE_URL, handleDeleteMessage, projects, setProjects }) {
  const [replyText, setReplyText] = useState({});
  const [adminList, setAdminList] = useState([]);
  const [userList, setUserList] = useState([]);
  const [activeTab, setActiveTab] = useState('messages');

  const [editingAdmin, setEditingAdmin] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '' });
  const [passwordReset, setPasswordReset] = useState({ id: '', newPassword: '' });

  const [selectedUserEmail, setSelectedUserEmail] = useState(null);
  const [projectForm, setProjectForm] = useState({ title: '', link: '', imageUrl: '' });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchMessages();
    fetchAdmins();
    fetchUsers();
    const interval = setInterval(() => { fetchMessages(); }, 5000); 
    return () => clearInterval(interval);
  }, [API_BASE_URL]);

  const uniqueUsers = useMemo(() => {
    const users = [];
    const seenEmails = new Set();
    adminMessages?.forEach(msg => {
      if (!seenEmails.has(msg.email)) {
        seenEmails.add(msg.email);
        users.push({ name: msg.name, email: msg.email });
      }
    });
    return users;
  }, [adminMessages]);

  useEffect(() => {
    if (uniqueUsers.length > 0 && !selectedUserEmail) {
      setSelectedUserEmail(uniqueUsers[0].email);
    }
  }, [uniqueUsers, selectedUserEmail]);

  const filteredMessages = adminMessages?.filter(msg => msg.email === selectedUserEmail) || [];

  const fetchAdmins = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/list`);
      const data = await res.json();
      if (data.success) setAdminList(data.admins);
    } catch (err) { console.error('የአድሚኖችን ዝርዝር ማምጣት አልተቻለም'); }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users`);
      const data = await res.json();
      if (data.success) setUserList(data.users);
    } catch (err) { console.error('የተጠቃሚዎችን ዝርዝር ማምጣት አልተቻለም'); }
  };

  const handleSendAdminMessage = async () => {
    const txt = replyText['global_admin_chat'];
    if (!txt || !txt.trim()) return alert('እባክዎ መጀመሪያ መልዕክት ይጻፉ!');
    const activeUser = uniqueUsers.find(u => u.email === selectedUserEmail);
    if (!activeUser) return alert('እባክዎ መጀመሪያ ደንበኛ ይምረጡ!');
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/send-new-message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: activeUser.name, email: selectedUserEmail, message: txt })
      });
      const data = await res.json();
      if (data.success) {
        setReplyText(prev => ({ ...prev, 'global_admin_chat': '' }));
        fetchMessages();
      }
    } catch (err) { alert('መልዕክቱን መላክ አልተቻለም'); }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    try {
      const imageUrl = await uploadImageToImgBB(file, setUploading);
      setProjectForm(prev => ({ ...prev, imageUrl: imageUrl }));
      alert('📸 ምስሉ በስኬት ተጭኗል!');
    } catch (err) { alert('ምስል መጫን አልተቻለም'); }
  };

  const handleProjectSubmit = async (e) => {
    e.preventDefault();
    if (!projectForm.imageUrl) return alert('እባክዎ መጀመሪያ ምስል ይምረጡ!');
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectForm)
      });
      if (res.ok) {
        alert('🎯 ፕሮጀክቱ ተመዝግቧል!');
        setProjectForm({ title: '', link: '', imageUrl: '' });
      }
    } catch (err) { alert('ስህተት ተፈጥሯል'); }
  };

  const handleUpdateAdmin = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/update/${editingAdmin}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        alert('የአድሚን መረጃ ተስተካክሏል!');
        setEditingAdmin(null);
        fetchAdmins();
      }
    } catch (err) { alert('ማስተካከል አልተሳካም'); }
  };

  const handleResetPassword = async (id) => {
    if (!passwordReset.newPassword || passwordReset.id !== id) return alert('እባክዎ መጀመሪያ አዲስ ፓስወርድ ይጻፉ!');
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/reset-password/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: passwordReset.newPassword })
      });
      if (res.ok) {
        alert('የአድሚኑ ፓስወርድ ተቀይሯል!');
        setPasswordReset({ id: '', newPassword: '' });
      }
    } catch (err) { alert('ፓስወርድ መቀየር አልተቻለም'); }
  };

  const handleDeleteAdmin = async (id) => {
    if (!window.confirm("ይህንን ረዳት አድሚን በእርግጥ ማጥፋት ይፈልጋሉ?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/delete/${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('አድሚኑ ተሰርዟል!');
        fetchAdmins();
      }
    } catch (err) { alert('ማጥፋት አልተሳካም'); }
  };

  const handleToggleBlockUser = async (id, isBlocked) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/block/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBlocked: !isBlocked })
      });
      if (res.ok) {
        alert(`ተጠቃሚው ተሻሽሏል!`);
        fetchUsers();
      }
    } catch (err) { alert('የብሎክ እርምጃው አልተሳካም'); }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("ይህንን ተጠቃሚ ማጥፋት ይፈልጋሉ?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/users/delete/${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('ተጠቃሚው ተሰርዟል!');
        fetchUsers();
      }
    } catch (err) { alert('ማጥፋት አልተቻለም'); }
  };

  const handleDeleteProject = async (id) => {
    if (window.confirm('ይህንን ፕሮጀክት ማጥፋት ይፈልጋሉ?')) {
      try {
        const res = await fetch(`${API_BASE_URL}/api/admin/projects/${id}`, { method: 'DELETE' });
        if (res.ok) {
          setProjects(prev => prev.filter(p => p._id !== id));
        }
      } catch (err) { alert('ማጥፋት አልተቻለም'); }
    }
  };

  return (
    <div className="admin-dashboard-container">
      <div className="admin-header">
        <h2>👑 የባለሙያ መቆጣጠሪያ ሰሌዳ</h2>
        <button onClick={handleLogout} className="btn-logout">ውጣ</button>
      </div>

      <div className="admin-tabs-nav">
        {['messages', 'projects', 'admins', 'users'].map((tab) => (
            <button key={tab} className={`tab-nav-btn ${activeTab === tab ? 'active-tab' : ''}`} onClick={() => setActiveTab(tab)}>
                {tab === 'messages' ? '💬 መልዕክቶች' : tab === 'projects' ? '🚀 ፖርትፎሊዮ' : tab === 'admins' ? '👥 አድሚኖች' : '👤 ደንበኞች'}
            </button>
        ))}
      </div>

      {activeTab === 'projects' && (
        <div className="card">
          <h3>🚀 ፖርትፎሊዮ ማስተዳደሪያ</h3>
          <input type="text" placeholder="የፕሮጀክቱ ስም" value={projectForm.title} onChange={(e) => setProjectForm({...projectForm, title: e.target.value})} className="input-field" />
          <input type="url" placeholder="የፕሮጀክቱ ሊንክ" value={projectForm.link} onChange={(e) => setProjectForm({...projectForm, link: e.target.value})} className="input-field" />
          <input type="file" onChange={handleImageUpload} className="input-field" />
          <button onClick={handleProjectSubmit} className="btn-action" disabled={uploading}>መዝግብ</button>
          
          <div className="admin-projects-list">
            {projects?.map((p) => (
              <div key={p._id}>
                <img src={p.imageUrl} alt={p.title} width="50" />
                <span>{p.title}</span>
                <button onClick={() => handleDeleteProject(p._id)}>🗑 አጥፋ</button>
              </div>
            )) || <p>ምንም ፕሮጀክት የለም።</p>}
          </div>
        </div>
      )}

      {activeTab === 'messages' && (
        <div className="telegram-admin-layout">
          <div className="telegram-sidebar">
            {uniqueUsers.map((u) => (
              <div key={u.email} onClick={() => setSelectedUserEmail(u.email)} className={`sidebar-user-item ${selectedUserEmail === u.email ? 'active-chat-user' : ''}`}>
                <h4>{u.name}</h4>
              </div>
            ))}
          </div>
          <div className="telegram-chat-window">
             {filteredMessages.map((msg) => (
                <div key={msg._id} className="admin-chat-block">
                    <p>{msg.message}</p>
                    <button onClick={() => handleDeleteMessage(msg._id)}>🗑</button>
                </div>
             ))}
          </div>
        </div>
      )}

      {activeTab === 'admins' && (
        <table className="custom-table">
          <tbody>
            {adminList?.map((adm) => (
              <tr key={adm._id}>
                <td>{adm.name}</td>
                <td>{adm.email}</td>
                <td><button onClick={() => handleDeleteAdmin(adm._id)}>🗑</button></td>
              </tr>
            )) || <tr><td colSpan="3">አድሚኖች የሉም</td></tr>}
          </tbody>
        </table>
      )}

      {activeTab === 'users' && (
        <table className="custom-table">
          <tbody>
            {userList?.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td><button onClick={() => handleDeleteUser(u._id)}>🗑 አካውንት አጥፋ</button></td>
              </tr>
            )) || <tr><td colSpan="2">ተጠቃሚዎች የሉም</td></tr>}
          </tbody>
        </table>
      )}
      
      <Footer />
    </div>
  );
}

export default AdminDashboard;
