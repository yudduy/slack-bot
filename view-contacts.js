require('dotenv').config();
const mongoose = require('mongoose');

// Define a simplified Contact schema (similar to your model)
const contactSchema = new mongoose.Schema({
  userId: String,
  name: String,
  email: String,
  phone: String,
  slackTeamId: String,
  channel: String,
  status: String,
  createdAt: Date,
  updatedAt: Date
});

async function viewContacts() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME || 'contact-bot'
    });
    
    // Create a model from the schema
    const Contact = mongoose.model('Contact', contactSchema);
    
    // Fetch all contacts
    const contacts = await Contact.find({});
    
    // Display the results
    console.log('\n===== CONTACTS IN DATABASE =====\n');
    if (contacts.length === 0) {
      console.log('No contacts found in the database.');
    } else {
      contacts.forEach((contact, index) => {
        console.log(`Contact #${index + 1}:`);
        console.log(`  Name: ${contact.name || 'N/A'}`);
        console.log(`  User ID: ${contact.userId}`);
        console.log(`  Email: ${contact.email || 'Not provided'}`);
        console.log(`  Phone: ${contact.phone || 'Not provided'}`);
        console.log(`  Created: ${contact.createdAt}`);
        console.log('----------------------------');
      });
      console.log(`\nTotal Contacts: ${contacts.length}`);
    }
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    
  } catch (error) {
    console.error('Error viewing contacts:', error);
  }
}

// Run the function
viewContacts();