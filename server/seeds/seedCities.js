const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '..', '..', '.env') });

const mongoose = require('mongoose');
const State = require('../models/State');
const City = require('../models/City');
const connectDB = require('../config/db');

// Major cities by state name
const citiesByState = {
  'Andhra Pradesh': [
    'Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Rajahmundry',
    'Kakinada', 'Tirupati', 'Anantapur', 'Kadapa', 'Eluru', 'Ongole', 'Nandyal',
    'Machilipatnam', 'Adoni', 'Tenali', 'Proddatur', 'Chittoor', 'Hindupur',
    'Bhimavaram', 'Madanapalle', 'Guntakal', 'Dharmavaram', 'Gudivada', 'Srikakulam',
    'Narasaraopet', 'Rajam', 'Tadpatri', 'Tadepalligudem', 'Chilakaluripet',
  ],
  'Arunachal Pradesh': [
    'Itanagar', 'Naharlagun', 'Pasighat', 'Tawang', 'Ziro', 'Bomdila',
    'Aalo', 'Tezu', 'Changlang', 'Roing', 'Khonsa', 'Seppa',
  ],
  'Assam': [
    'Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia',
    'Tezpur', 'Bongaigaon', 'Diphu', 'North Lakhimpur', 'Dhubri', 'Karimganj',
    'Sivasagar', 'Goalpara', 'Barpeta', 'Mangaldoi', 'Nalbari', 'Haflong',
  ],
  'Bihar': [
    'Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga',
    'Bihar Sharif', 'Arrah', 'Begusarai', 'Katihar', 'Munger', 'Chhapra',
    'Saharsa', 'Sasaram', 'Hajipur', 'Dehri', 'Siwan', 'Motihari',
    'Nawada', 'Bagaha', 'Buxar', 'Kishanganj', 'Sitamarhi', 'Jamalpur',
    'Jehanabad', 'Aurangabad', 'Madhubani', 'Samastipur', 'Bettiah',
  ],
  'Chhattisgarh': [
    'Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Durg', 'Rajnandgaon',
    'Jagdalpur', 'Raigarh', 'Ambikapur', 'Mahasamund', 'Dhamtari', 'Chirmiri',
    'Kawardha', 'Kanker', 'Kondagaon', 'Mungeli',
  ],
  'Goa': [
    'Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda', 'Bicholim',
    'Curchorem', 'Sanquelim', 'Cuncolim', 'Canacona', 'Quepem', 'Sanguem',
  ],
  'Gujarat': [
    'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar',
    'Junagadh', 'Gandhinagar', 'Anand', 'Nadiad', 'Morbi', 'Mehsana',
    'Bharuch', 'Navsari', 'Valsad', 'Vapi', 'Gondal', 'Veraval', 'Godhra',
    'Patan', 'Kalol', 'Dahod', 'Botad', 'Amreli', 'Deesa', 'Jetpur',
    'Palanpur', 'Gandhidham', 'Porbandar', 'Surendranagar', 'Dwarka',
  ],
  'Haryana': [
    'Faridabad', 'Gurgaon', 'Panipat', 'Ambala', 'Yamunanagar', 'Rohtak',
    'Hisar', 'Karnal', 'Sonipat', 'Panchkula', 'Bhiwani', 'Sirsa',
    'Bahadurgarh', 'Jind', 'Thanesar', 'Kaithal', 'Rewari', 'Palwal',
    'Hansi', 'Narnaul', 'Fatehabad', 'Hodal', 'Tohana', 'Narwana',
  ],
  'Himachal Pradesh': [
    'Shimla', 'Dharamshala', 'Solan', 'Mandi', 'Palampur', 'Baddi',
    'Nahan', 'Hamirpur', 'Una', 'Bilaspur', 'Chamba', 'Kullu', 'Manali',
    'Kangra', 'Parwanoo', 'Sundernagar', 'Paonta Sahib',
  ],
  'Jharkhand': [
    'Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro', 'Deoghar', 'Hazaribagh',
    'Giridih', 'Ramgarh', 'Phusro', 'Medininagar', 'Chaibasa', 'Dumka',
    'Chatra', 'Gumla', 'Lohardaga', 'Pakur',
  ],
  'Karnataka': [
    'Bengaluru', 'Mysuru', 'Hubballi', 'Mangaluru', 'Belagavi', 'Davanagere',
    'Ballari', 'Tumakuru', 'Shivamogga', 'Raichur', 'Bidar', 'Dharwad',
    'Hassan', 'Mandya', 'Udupi', 'Kolar', 'Chitradurga', 'Gulbarga',
    'Ramanagara', 'Chikkamagaluru', 'Bagalkot', 'Gadag', 'Hospet',
    'Robertsonpet', 'Bhadravati', 'Chikkaballapur', 'Gangavathi',
  ],
  'Kerala': [
    'Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam',
    'Palakkad', 'Alappuzha', 'Kannur', 'Kottayam', 'Malappuram',
    'Thalassery', 'Kasaragod', 'Attingal', 'Kayamkulam', 'Punalur',
    'Manjeri', 'Vatakara', 'Irinjalakuda', 'Perinthalmanna', 'Mattanur',
    'Tirur', 'Thodupuzha', 'Changanassery', 'Pala', 'Nedumangad',
  ],
  'Madhya Pradesh': [
    'Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar',
    'Dewas', 'Satna', 'Ratlam', 'Rewa', 'Murwara', 'Singrauli',
    'Burhanpur', 'Khandwa', 'Bhind', 'Chhindwara', 'Guna', 'Shivpuri',
    'Vidisha', 'Damoh', 'Mandsaur', 'Khargone', 'Neemuch', 'Pithampur',
    'Hoshangabad', 'Itarsi', 'Sehore', 'Betul', 'Seoni', 'Datia',
  ],
  'Maharashtra': [
    'Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Aurangabad', 'Solapur',
    'Kolhapur', 'Amravati', 'Navi Mumbai', 'Sangli', 'Jalgaon', 'Akola',
    'Latur', 'Dhule', 'Ahmednagar', 'Chandrapur', 'Parbhani', 'Ichalkaranji',
    'Jalna', 'Ambarnath', 'Bhusawal', 'Panvel', 'Badlapur', 'Beed',
    'Gondia', 'Satara', 'Barshi', 'Yavatmal', 'Wardha', 'Osmanabad',
    'Nanded', 'Ratnagiri', 'Vasai-Virar', 'Kalyan-Dombivli', 'Mira-Bhayandar',
  ],
  'Manipur': [
    'Imphal', 'Thoubal', 'Bishnupur', 'Churachandpur', 'Kakching',
    'Senapati', 'Ukhrul', 'Tamenglong', 'Chandel', 'Jiribam',
  ],
  'Meghalaya': [
    'Shillong', 'Tura', 'Jowai', 'Nongstoin', 'Williamnagar', 'Baghmara',
    'Resubelpara', 'Mairang', 'Nongpoh', 'Cherrapunjee',
  ],
  'Mizoram': [
    'Aizawl', 'Lunglei', 'Saiha', 'Champhai', 'Serchhip', 'Kolasib',
    'Lawngtlai', 'Mamit', 'Saitual', 'Hnahthial',
  ],
  'Nagaland': [
    'Kohima', 'Dimapur', 'Mokokchung', 'Tuensang', 'Wokha', 'Zunheboto',
    'Mon', 'Phek', 'Kiphire', 'Longleng', 'Peren',
  ],
  'Odisha': [
    'Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur',
    'Puri', 'Balasore', 'Baripada', 'Bhadrak', 'Jharsuguda', 'Jeypore',
    'Barbil', 'Paradip', 'Bargarh', 'Kendrapara', 'Angul', 'Rayagada',
    'Dhenkanal', 'Koraput', 'Jajpur', 'Jagatsinghpur', 'Phulbani',
  ],
  'Punjab': [
    'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Mohali',
    'Hoshiarpur', 'Batala', 'Pathankot', 'Moga', 'Abohar', 'Malerkotla',
    'Khanna', 'Muktsar', 'Barnala', 'Rajpura', 'Firozpur', 'Kapurthala',
    'Faridkot', 'Sangrur', 'Fazilka', 'Gurdaspur', 'Nawanshahr', 'Ropar',
  ],
  'Rajasthan': [
    'Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur',
    'Bhilwara', 'Alwar', 'Bharatpur', 'Sikar', 'Pali', 'Sri Ganganagar',
    'Tonk', 'Kishangarh', 'Beawar', 'Hanumangarh', 'Dhaulpur', 'Gangapur City',
    'Sawai Madhopur', 'Barmer', 'Jhunjhunu', 'Churu', 'Chittorgarh',
    'Nagaur', 'Jhalawar', 'Bundi', 'Baran', 'Pratapgarh', 'Dungarpur',
    'Banswara', 'Rajsamand', 'Sirohi', 'Jaisalmer', 'Mount Abu',
  ],
  'Sikkim': [
    'Gangtok', 'Namchi', 'Gyalshing', 'Mangan', 'Rangpo', 'Singtam',
    'Jorethang', 'Ravangla',
  ],
  'Tamil Nadu': [
    'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem',
    'Tirunelveli', 'Tiruppur', 'Vellore', 'Erode', 'Thoothukudi',
    'Dindigul', 'Thanjavur', 'Ranipet', 'Sivakasi', 'Karur',
    'Udhagamandalam', 'Hosur', 'Nagercoil', 'Kanchipuram', 'Kumarapalayam',
    'Rajapalayam', 'Kumbakonam', 'Ambur', 'Tiruvannamalai', 'Pollachi',
    'Cuddalore', 'Nagapattinam', 'Chidambaram', 'Pudukkottai', 'Ariyalur',
  ],
  'Telangana': [
    'Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam',
    'Mahbubnagar', 'Ramagundam', 'Nalgonda', 'Adilabad', 'Suryapet',
    'Miryalaguda', 'Siddipet', 'Mancherial', 'Jagtial', 'Kamareddy',
    'Nirmal', 'Wanaparthy', 'Kothagudem', 'Bodhan', 'Sangareddy',
  ],
  'Tripura': [
    'Agartala', 'Dharmanagar', 'Udaipur', 'Kailasahar', 'Belonia',
    'Ambassa', 'Khowai', 'Teliamura', 'Sabroom', 'Sonamura',
  ],
  'Uttar Pradesh': [
    'Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Varanasi', 'Meerut',
    'Allahabad', 'Bareilly', 'Aligarh', 'Moradabad', 'Saharanpur',
    'Gorakhpur', 'Noida', 'Firozabad', 'Jhansi', 'Muzaffarnagar',
    'Mathura', 'Rampur', 'Shahjahanpur', 'Farrukhabad', 'Mau',
    'Hapur', 'Etawah', 'Mirzapur', 'Bulandshahr', 'Sambhal',
    'Amroha', 'Hardoi', 'Fatehpur', 'Raebareli', 'Orai',
    'Sitapur', 'Bahraich', 'Modinagar', 'Unnao', 'Jaunpur',
    'Lakhimpur', 'Hathras', 'Banda', 'Pilibhit', 'Barabanki',
    'Khurja', 'Gonda', 'Mainpuri', 'Lalitpur', 'Etah',
    'Deoria', 'Sultanpur', 'Azamgarh', 'Bijnor', 'Basti',
    'Ayodhya', 'Greater Noida',
  ],
  'Uttarakhand': [
    'Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rudrapur', 'Kashipur',
    'Rishikesh', 'Kotdwar', 'Ramnagar', 'Pithoragarh', 'Mussoorie',
    'Almora', 'Nainital', 'Bageshwar', 'Chamoli', 'Uttarkashi', 'Tehri',
    'Srinagar', 'Pauri', 'Champawat', 'Lansdowne',
  ],
  'West Bengal': [
    'Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri', 'Bardhaman',
    'Malda', 'Baharampur', 'Habra', 'Kharagpur', 'Shantipur', 'Dankuni',
    'Dhulian', 'Ranaghat', 'Haldia', 'Raiganj', 'Krishnanagar', 'Nabadwip',
    'Medinipur', 'Jalpaiguri', 'Balurghat', 'Basirhat', 'Bankura',
    'Darjeeling', 'Alipurduar', 'Purulia', 'Jangipur', 'Tamluk', 'Contai',
  ],
  'Delhi': [
    'New Delhi', 'Delhi', 'Dwarka', 'Rohini', 'Saket', 'Lajpat Nagar',
    'Karol Bagh', 'Connaught Place', 'Chandni Chowk', 'Mehrauli',
    'Najafgarh', 'Narela', 'Shahdara', 'Pitampura',
  ],
  'Jammu and Kashmir': [
    'Srinagar', 'Jammu', 'Anantnag', 'Sopore', 'Baramulla', 'Kathua',
    'Udhampur', 'Pulwama', 'Kupwara', 'Poonch', 'Rajouri', 'Ganderbal',
    'Bandipora', 'Kulgam', 'Shopian', 'Budgam',
  ],
  'Ladakh': [
    'Leh', 'Kargil', 'Diskit', 'Panamik', 'Nyoma',
  ],
  'Chandigarh': [
    'Chandigarh',
  ],
};

const seed = async () => {
  await connectDB();
  await City.deleteMany({});

  const states = await State.find();
  const stateMap = {};
  states.forEach((s) => { stateMap[s.stateName] = s._id; });

  const cityDocs = [];
  for (const [stateName, cities] of Object.entries(citiesByState)) {
    const stateId = stateMap[stateName];
    if (!stateId) {
      console.warn(`State not found: ${stateName}`);
      continue;
    }
    for (const cityName of cities) {
      cityDocs.push({ cityName, state: stateId });
    }
  }

  await City.insertMany(cityDocs);
  console.log(`Seeded ${cityDocs.length} cities across ${Object.keys(citiesByState).length} states`);
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
