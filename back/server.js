const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
require('dotenv').config();

const app = express();
app.use(express.json());

// 📦 ፋይሉን በጊዜያዊነት ኮምፒዩተሩ ላይ ለማስቀመጥ (Temp Storage for Multer)
const upload = multer({ dest: 'uploads/' });

// የ CORS አደረጃጀት - ማንኛውንም ግንኙነት እንዳያግድ ክፍት ተደርጓል
app.use(cors({
  origin: '*',
  methods: ['POST', 'GET', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

// MongoDB የግንኙነት መስመር
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB በስኬት ተገናኝቷል!');
    seedFirstAdmin(); // ዳታቤዙ እንደተገናኘ የመጀመሪያውን አድሚን ይፈትሻል/ይፈጥራል
  })
  .catch(err => console.error('❌ የዳታቤዝ ግንኙነት ስህተት:', err));

const IMGBB_API_KEY = "ebd592608f4dba1e8271bec8e920c408";

// ==========================================
// 1. የዳታቤዝ ሞዴሎች (SCHEMAS & MODELS)
// ==========================================

// ሀ. የተጠቃሚዎች (User) ስኬማ
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true }, // እንደ ዩዘርኔም የሚያገለግል
  password: { type: String, required: true },
  role: { type: String, default: 'normal' }, // 'normal', 'admin', ወይም 'employee'
  isBlocked: { type: Boolean, default: false } // 🚫 ለብሎክ ማድረጊያ የተጨመረ
});
const User = mongoose.model('User', userSchema);

// ለ. የማዘዣዎች/መልዕክቶች (Contact/Order) ስኬማ
const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true }, // ከደንበኛው email ጋር የሚገናኝበት
  message: { type: String, required: true },
  reply: { type: String, default: '' }, // የአድሚን መልስ ማከማቻ
  status: { type: String, default: 'በጥበቃ ላይ' }, // 'በጥበቃ ላይ' ወይም 'ምላሽ ተሰጥቷል'
  date: { type: Date, default: Date.now }
});
const Contact = mongoose.model('Contact', contactSchema);

// ሐ. የፕሮጀክት ስኪማ
const projectSchema = new mongoose.Schema({
  title: String,
  link: String,
  imageUrl: String,
  date: { type: Date, default: Date.now }
});
const Project = mongoose.model('Project', projectSchema);

// መ. የምግብ/ምናሌ ስኬማ (Food Schema - ከ ImgBB ሊንክ ጋር የሚጣጣም)
const foodSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  date: { type: Date, default: Date.now }
});
const Food = mongoose.model('Food', foodSchema);

// ==========================================
// 2. የመጀመሪያው አድሚን መፍጠሪያ (SEEDING)
// ==========================================
async function seedFirstAdmin() {
  try {
    const adminEmail = 'mamaruAnmaw@1925';
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('mame192513', 10);
      const firstAdmin = new User({
        name: 'Mamaru Anmaw (Main Admin)',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin'
      });
      await firstAdmin.save();
      console.log('👑 የመጀመሪያው ዋና አድሚን በስኬት ዳታቤዝ ውስጥ ተፈጥሯል!');
    }
  } catch (error) {
    console.error('ዋናውን አድሚን መፍጠር አልተቻለም:', error);
  }
}

// 🌐 ምስል ወደ ImgBB የሚልክ ረዳት ፋንክሽን (Helper Function)
async function uploadToImgBB(filePath) {
  try {
    const form = new FormData();
    form.append('image', fs.createReadStream(filePath));

    const response = await axios.post(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, form, {
      headers: { ...form.getHeaders() }
    });

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath); // ጊዜያዊ ፋይሉን እናጥፋዋለን
    }

    if (response.data && response.data.success) {
      return response.data.data.url;
    }
    throw new Error('ImgBB upload failed');
  } catch (error) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw error;
  }
}

// ==========================================
// 🍲 የምግብ ማስተዳደሪያ መስመሮች (FOOD CRUD ROUTES)
// ==========================================

// 1. ምግብ መመዝገቢያ (CREATE) - ከ ImgBB ፋይል ሰቀላ ጋር
app.post('/api/foods', upload.single('image'), async (req, res) => {
  try {
    const { name, description, price } = req.body;
    let imageUrl = req.body.imageUrl || '';

    if (req.file) {
      imageUrl = await uploadToImgBB(req.file.path);
    }

    if (!imageUrl) {
      return res.status(400).json({ success: false, error: 'እባክዎ የምግብ ምስል ይምረጡ!' });
    }

    const newFood = new Food({ name, description, price, imageUrl });
    await newFood.save();
    res.status(201).json({ success: true, message: 'ምግብ በተሳካ ሁኔታ ተጨምሯል!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'ምግብ መመዝገብ አልተቻለም' });
  }
});

// 2. ምግቦችን ማምጫ (READ)
app.get('/api/foods', async (req, res) => {
  try {
    const foods = await Food.find().sort({ date: -1 });
    res.status(200).json({ success: true, foods: foods, menu: foods });
  } catch (error) {
    res.status(500).json({ success: false, error: 'ምግቦቹን ማምጣት አልተቻለም' });
  }
});

// 3. ሰራተኛው/አድሚኑ ምግብ የሚያስተካክልበት መስመር (UPDATE)
app.put('/api/employee/foods/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, description, price } = req.body;
    let updateData = { name, description, price };

    if (req.file) {
      updateData.imageUrl = await uploadToImgBB(req.file.path);
    }

    await Food.findByIdAndUpdate(req.params.id, updateData);
    res.status(200).json({ success: true, message: 'ምግቡ ተስተካክሏል!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: 'ምግቡን ማስተካከል አልተቻለም' });
  }
});

// 4. ምግብ ማጥፊያ (DELETE - ለአድሚን እና ለሰራተኛ የሚሆን)
app.delete('/api/employee/foods/:id', async (req, res) => {
  try {
    await Food.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'ምግቡ ተሰርዟል!' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'ምግቡን ማጥፋት አልተቻለም' });
  }
});

app.delete('/api/admin/foods/:id', async (req, res) => {
  try {
    await Food.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'ምግቡ ተሰርዟል!' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'ምግቡን ማጥፋት አልተቻለም' });
  }
});

// አዲስ ሲስተም መመዝገቢያ (POST)
app.post('/api/admin/projects', async (req, res) => {
  const newProject = new Project(req.body);
  await newProject.save();
  res.json({ success: true });
});

// ሲስተሞችን ማምጫ (GET)
app.get('/api/projects', async (req, res) => {
  const projects = await Project.find().sort({ date: -1 });
  res.json({ success: true, projects });
});

// ሲስተሞችን ማጥፊያ (DELETE)
app.delete('/api/admin/projects/:id', async (req, res) => {
  await Project.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// ==========================================
// 3. የደህንነት እና መግቢያ መስመሮች (AUTH ROUTES)
// ==========================================

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, error: 'ይህ ኢሜይል/ዩዘርኔም ቀድሞ ተመዝግቧል!' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: 'normal'
    });

    await newUser.save();
    res.status(201).json({ success: true, message: 'ምዝገባው በስኬት ተጠናቋል!' });
  } catch (error) {
    console.error("SIGNUP ERROR:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, error: 'ኢሜይል/ዩዘርኔም ወይም ፓስወርድ ተሳስቷል!' });

    if (user.isBlocked) {
      return res.status(403).json({ success: false, error: 'አካውንትዎ በአድሚን ታግዷል! እባክዎ ባለሙያ ያነጋግሩ።' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, error: 'ኢሜይል/ዩዘርኔም ወይም ፓስወርድ ተሳስቷል!' });

    res.status(200).json({
      success: true,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'የመግባት ስህተት ተፈጥሯል' });
  }
});

// ==========================================
// 4. የአድሚን መቆጣጠሪያ መስመሮች (ADMIN CONTROL ROUTES)
// ==========================================

app.post('/api/admin/add-admin', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, error: 'ይህ ኢሜይል/ዩዘርኔም ቀድሞ ተመዝግቧል!' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = new User({
      name,
      email,
      password: hashedPassword,
      role: 'admin'
    });

    await newAdmin.save();
    res.status(201).json({ success: true, message: 'አዲሱ አድሚን በስኬት ተመዝግቧል!' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'አድሚን መፍጠር አልተቻለም' });
  }
});

app.get('/api/admin/list', async (req, res) => {
  try {
    const admins = await User.find({ role: 'admin' }).select('-password');
    res.status(200).json({ success: true, admins });
  } catch (error) {
    res.status(500).json({ success: false, error: 'የአድሚኖችን ዝርዝር ማምጣት አልተቻለም' });
  }
});

app.put('/api/admin/update/:id', async (req, res) => {
  try {
    const { name, email } = req.body;
    await User.findByIdAndUpdate(req.params.id, { name, email });
    res.status(200).json({ success: true, message: 'የአድሚን መረጃ ተስተካክሏል!' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'ማስተካከሉ አልተሳካም' });
  }
});

app.put('/api/admin/reset-password/:id', async (req, res) => {
  try {
    const { newPassword } = req.body;
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(req.params.id, { password: hashedPassword });
    res.status(200).json({ success: true, message: 'የአድሚኑ ፓስወርድ በስኬት ተለውጧል!' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'ፓስወርድ መቀየር አልተቻለም' });
  }
});

app.delete('/api/admin/delete/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'አድሚኑ በተሳካ ሁኔታ ተሰርዟል!' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'አድሚኑን ማጥፋት አልተቻለም' });
  }
});

app.get('/api/admin/messages', async (req, res) => {
  try {
    const messages = await Contact.find().sort({ date: -1 });
    res.status(200).json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, error: 'መረጃዎችን ማምጣት አልተቻለም' });
  }
});

// ለአጠቃላይ መልዕክቶች ማምጫ (ለ Employee Dashboard ሪአክተር የሚጠቅም)
app.get('/api/messages', async (req, res) => {
  try {
    const messages = await Contact.find().sort({ date: -1 });
    res.status(200).json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, error: 'መልዕክቶችን ማምጣት አልተቻለም' });
  }
});

app.post('/api/admin/reply/:id', async (req, res) => {
  try {
    const { reply } = req.body;
    await Contact.findByIdAndUpdate(req.params.id, { 
      reply: reply, 
      status: 'ምላሽ ተሰጥቷል' 
    });
    res.status(200).json({ success: true, message: 'ምላሽዎ በተሳካ ሁኔታ ተልኳል!' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'ምላሽ መላክ አልተቻለም' });
  }
});

app.delete('/api/admin/messages/:id', async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'ማዘዣው ተሰርዟል!' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'ማጥፋት አልተቻለም' });
  }
});

app.post('/api/admin/add-employee', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Employee already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const employee = new User({
      name,
      email,
      password: hashedPassword,
      role: 'employee'
    });

    await employee.save();
    res.status(201).json({ success: true, message: 'Employee created successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to create employee.' });
  }
});

// ==========================================
// 5. የተጠቃሚዎች ማስተዳደሪያ (USER MANAGEMENT ROUTES)
// ==========================================

app.get('/api/admin/users', async (req, res) => {
  try {
    const registeredUsers = await User.find({ role: 'normal' }).select('-password').lean();
    const chatEmails = await Contact.distinct('email');
    let finalUsersList = [...registeredUsers];

    for (const email of chatEmails) {
      const alreadyExists = finalUsersList.some(u => u.email === email);
      const isMainAdmin = email === 'mamaruAnmaw@1925'; 

      if (!alreadyExists && !isMainAdmin) {
        const sampleContact = await Contact.findOne({ email });
        if (sampleContact) {
          finalUsersList.push({
            _id: sampleContact._id, 
            name: sampleContact.name || 'ስም የሌለው ደንበኛ',
            email: email,
            isBlocked: false,
            isChatOnly: true   
          });
        }
      }
    } 
    res.status(200).json({ success: true, users: finalUsersList });
  } catch (error) {
    res.status(500).json({ success: false, error: 'የደንበኞችን ዝርዝር ማጠናቀር አልተቻለም' });
  }
});

app.put('/api/admin/users/block/:id', async (req, res) => {
  try {
    const { isBlocked } = req.body;
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (user) {
      await User.findByIdAndUpdate(userId, { isBlocked });
    } else {
      const contactData = await Contact.findById(userId);
      if (contactData) {
        const dummyPassword = await bcrypt.hash('BLOCKED_USER_PASS_123', 10);
        const blockedUser = new User({
          name: contactData.name,
          email: contactData.email,
          password: dummyPassword,
          role: 'normal',
          isBlocked: isBlocked
        });
        await blockedUser.save();
      }
    }

    res.status(200).json({ success: true, message: 'የተጠቃሚው የብሎክ ሁኔታ ተቀይሯል!' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'ብሎክ ማድረግ አልተሳካም' });
  }
});

app.delete('/api/admin/users/delete/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    
    if (user) {
      await User.findByIdAndDelete(userId);
    } else {
      await Contact.findByIdAndDelete(userId);
    }
    
    res.status(200).json({ success: true, message: 'ተጠቃሚው ሙሉ በሙሉ ተሰርዟል!' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'ተጠቃሚውን ማጥፋት አልተቻለም' });
  }
});

app.get('/api/admin/employees-list', async (req, res) => {
  try {
    const employees = await User.find({ role: 'employee' }).select('-password');
    res.status(200).json({ success: true, employees });
  } catch (error) {
    res.status(500).json({ success: false, error: 'የሰራተኞችን ዝርዝር ማምጣት አልተቻለም' });
  }
});

app.put('/api/admin/employee-update/:id', async (req, res) => {
  try {
    const { name, email } = req.body;
    await User.findByIdAndUpdate(req.params.id, { name, email });
    res.status(200).json({ success: true, message: 'የሰራተኛው መረጃ ተስተካክሏል!' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'ሰራተኛውን ማስተካከል አልተሳካም' });
  }
});

app.put('/api/admin/employee-reset-password/:id', async (req, res) => {
  try {
    const { newPassword } = req.body;
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(req.params.id, { password: hashedPassword });
    res.status(200).json({ success: true, message: 'የሰራተኛው ፓስወርድ በስኬት ተለውጧል!' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'የሰራተኛ ፓስወርድ መቀየር አልተቻለም' });
  }
});

app.delete('/api/admin/employee-delete/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'ሰራተኛው በተሳካ ሁኔታ ተሰርዟል!' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'ሰራተኛውን ማጥፋት አልተቻለም' });
  }
});

// ==========================================
// 6. የደንበኞች ማዘዣ መስመሮች (USER/ORDER ROUTES)
// ==========================================

app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    
    const checkUser = await User.findOne({ email });
    if (checkUser && checkUser.isBlocked) {
      return res.status(403).json({ success: false, error: 'አካውንትዎ የታገደ በመሆኑ መልዕክት መላክ አይችሉም!' });
    }

    const newContact = new Contact({ name, email, message });
    await newContact.save();
    res.status(201).json({ success: true, message: 'ትዕዛዝዎ በስኬት ተቀምጧል!' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'ትዕዛዙን ማስቀመጥ አልተቻለም' });
  }
});

app.get('/api/user/orders/:email', async (req, res) => {
  try {
    const orders = await Contact.find({ email: req.params.email }).sort({ date: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, error: 'ማዘዣዎችዎን ማምጣት አልተቻለም' });
  }
});

app.put('/api/user/orders/edit/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    const { message } = req.body;

    const updatedOrder = await Contact.findByIdAndUpdate(
      orderId,
      { message: message },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: "መልዕክቱ አልተገኘም" });
    }

    res.json({ success: true, message: "መልዕክቱ በተሳካ ሁኔታ ተስተካክሏል", order: updatedOrder });
  } catch (err) {
    res.status(500).json({ success: false, message: "የባክኤንድ ስህተት ገጥሟል" });
  }
});

app.delete('/api/user/orders/delete/:id', async (req, res) => {
  try {
    const orderId = req.params.id;
    const deletedOrder = await Contact.findByIdAndDelete(orderId);

    if (!deletedOrder) {
      return res.status(404).json({ success: false, message: "መልዕክቱ አልተገኘም" });
    }

    res.json({ success: true, message: "መልዕክቱ በተሳካ ሁኔታ ጠፍቷል" });
  } catch (err) {
    res.status(500).json({ success: false, message: "የባክኤንድ ስህተት ገጥሟል" });
  }
});

app.post('/api/admin/send-new-message', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    
    if (!email || !message) {
      return res.status(400).json({ success: false, error: 'እባክዎ ኢሜይል እና መልዕክት በትክክል ያስገቡ!' });
    }

    const adminNewOrder = new Contact({
      name: name,
      email: email,
      message: `[የባለሙያ መልዕክት]፦ ${message}`, 
      reply: message, 
      status: 'ምላሽ ተሰጥቷል'
    });

    await adminNewOrder.save();
    res.status(201).json({ success: true, message: 'መልዕክትዎ ለደንበኛው ተልኳል!' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'መልዕክት መላክ አልተቻለም' });
  }
});

// 📦 ደንበኛ ከካርት የሚልካቸውን ትዕዛዞች እና የክፍያ ስክሪንሾት መቀበያ ራውት
app.post('/api/orders', async (req, res) => {
  try {
    const { userId, customerName, customerEmail, items, totalAmount, paymentScreenshot } = req.body;

    if (!customerEmail || !items || items.length === 0) {
      return res.status(400).json({ success: false, error: 'የምግብ ዝርዝር ወይም የኢሜይል መረጃ ጠፍቷል!' });
    }

    if (!paymentScreenshot) {
      return res.status(400).json({ success: false, error: 'እባክዎ የክፍያ ማረጋገጫ (ስክሪንሾት) ያያይዙ!' });
    }

    // መረጃውን ከምግብ ዝርዝር ጋር በ Contact (ወይም Order) Schema ውስጥ እናስቀምጣለን
    const orderDetailsString = items.map(i => `${i.name} (ብዛት: ${i.quantity || 1}) - ብር ${i.price}`).join(', ');
    
    const newOrder = new Contact({
      name: customerName || 'ደንበኛ',
      email: customerEmail,
      message: `የታዘዙ ምግቦች: [ ${orderDetailsString} ] | አጠቃላይ ዋጋ: ብር ${totalAmount} | የክፍያ ማረጋገጫ: ${paymentScreenshot}`,
      status: 'በጥበቃ ላይ' // ሰራተኛው እስኪያየው ድረስ
    });

    await newOrder.save();
    res.status(201).json({ success: true, message: 'ትዕዛዝዎ በስኬት ተልኳል!' });
  } catch (error) {
    console.error('ORDER ERROR:', error);
    res.status(500).json({ success: false, error: 'ትዕዛዙን ማስቀመጥ አልተቻለም' });
  }
});

// ==========================================
// 7. የሰርቨር ጤንነት እና ማስነሻ (SERVER START)
// ==========================================
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'ሰርቨሩ ዝግጁ ነው!' });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 ሰርቨር በፖርት ${PORT} ላይ ስራ ጀመረ!`));
