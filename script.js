// Supabase initialization
const supabaseUrl = 'https://kxovfjwoookxjfdyjivt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4b3Zmandvb29reGpmZHlqaXZ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU2NjE2MzAsImV4cCI6MjA2MTIzNzYzMH0.SjmUDqEqzRAFCDdNXrxoXRQQa9x3BSRFoCTTH-jMJ8Q';
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// Admin WhatsApp number
const ADMIN_WA_NUMBER = '6288223881917';

// Temporary frontend bookings data
let bookings = [];

// Toggle mobile menu
function toggleMenu() {
  const navLinks = document.getElementById('navLinks');
  navLinks.classList.toggle('active');
}

// Page load event
window.onload = function() {
  fetchBookings();
};

// Open booking modal
function openBookingModal(fieldType) {
  document.getElementById('modal-title').innerText = `Pesan ${fieldType}`;
  document.getElementById('field-type').value = fieldType;
  document.getElementById('booking-modal').style.display = 'block';
  populateTimeOptions(fieldType);
}

// Close booking modal
function closeBookingModal() {
  document.getElementById('booking-modal').style.display = 'none';
  document.getElementById('booking-form').reset();
}

// Populate time options based on field type
function populateTimeOptions(fieldType) {
  const timeSelect = document.getElementById('booking-time');
  timeSelect.innerHTML = '<option value="">Pilih Jam</option>';

  let startHour, endHour;

  if (fieldType === 'Lapangan Voli') {
    startHour = 8;
    endHour = 22;
  } else if (fieldType === 'Lapangan Mini Soccer') {
    startHour = 8;
    endHour = 23;
  } else if (fieldType === 'Lapangan Tenis') {
    startHour = 6;
    endHour = 21;
  } else {
    startHour = 8;
    endHour = 20;
  }

  for (let hour = startHour; hour <= endHour; hour++) {
    const hourString = hour.toString().padStart(2, '0') + ':00';
    const option = document.createElement('option');
    option.value = hourString;
    option.textContent = hourString;
    timeSelect.appendChild(option);
  }
}

// Calculate end time
function calculateEndTime(startTime, duration) {
  const [hours, minutes] = startTime.split(':').map(Number);
  let newHour = hours + duration;
  if (newHour >= 24) newHour -= 24;
  return `${String(newHour).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

// Submit booking form
async function submitBooking(event) {
  event.preventDefault();
  
  try {
    const field = document.getElementById('field-type').value.trim();
    const name = document.getElementById('booking-name').value.trim();
    const phone = document.getElementById('booking-phone').value.trim();
    const date = document.getElementById('booking-date').value;
    const time = document.getElementById('booking-time').value;
    const duration = parseInt(document.getElementById('booking-duration').value);

    // Validate form fields
    if (!field || !name || !phone || !date || !time || isNaN(duration)) {
      alert('Semua field harus diisi!');
      return;
    }

    const endTime = calculateEndTime(time, duration);

    // Add loading indicator
    const submitBtn = event.target.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Memproses...';
    submitBtn.disabled = true;

    // Save to Supabase
    const { data, error } = await supabase
      .from('booking')
      .insert([{
        field,
        name,
        phone,
        date,
        time,
        duration,
        status: 'Menunggu Konfirmasi'
      }])
      .select();

    // Reset button state
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;

    if (error) {
      console.error('Error Supabase:', error);
      throw new Error('Gagal menyimpan data ke database');
    }

    // Update frontend with new booking
    if (data && data.length > 0) {
      bookings.push(data[0]);
      displayBookings();
      closeBookingModal();

      // User feedback
      alert('Booking berhasil dibuat! Sedang mengarahkan ke WhatsApp...');

      // Redirect to WhatsApp
      const waMessage = `Halo Admin,%0ASaya ingin booking ${field}%0ANama: ${name}%0ANo HP: ${phone}%0ATanggal: ${date}%0AJam: ${time} - ${endTime}%0ADurasi: ${duration} jam.%0ATerima kasih!`;
      window.open(`https://wa.me/${ADMIN_WA_NUMBER}?text=${waMessage}`, '_blank');
    } else {
      alert('Tidak ada data yang dikembalikan dari server. Mohon coba lagi.');
    }
  } catch (error) {
    console.error('Gagal booking:', error.message);
    alert('Booking gagal. Silakan cek koneksi internet dan pastikan Supabase berfungsi dengan baik.');
  }
}

// Display bookings in table
function displayBookings() {
  const tbody = document.querySelector('#booking-table tbody');
  tbody.innerHTML = '';

  if (bookings.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Belum ada jadwal pemesanan</td></tr>';
    return;
  }

  bookings.forEach(booking => {
    const row = `
      <tr>
        <td>${booking.field}</td>
        <td>${booking.date}</td>
        <td>${booking.time} (${booking.duration} jam)</td>
        <td>${booking.status}</td>
        <td><button class="cancel-btn" onclick="cancelBooking(${booking.id})">Batal</button></td>
      </tr>
    `;
    tbody.innerHTML += row;
  });
}

// Fetch bookings from database
async function fetchBookings() {
  try {
    const { data, error } = await supabase
      .from('booking')
      .select('*')
      .order('date', { ascending: true });

    if (error) throw error;

    bookings = data || [];
    displayBookings();
  } catch (error) {
    console.error('Gagal mengambil data booking:', error.message);
    const tbody = document.querySelector('#booking-table tbody');
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Gagal memuat data jadwal. Cek koneksi atau refresh halaman.</td></tr>';
  }
}

// Cancel booking
async function cancelBooking(id) {
  if (!confirm('Apakah Anda yakin ingin membatalkan pemesanan ini?')) {
    return;
  }

  try {
    const { error } = await supabase
      .from('booking')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    
    // Update frontend
    bookings = bookings.filter(b => b.id !== id);
    displayBookings();
    
    alert('Pemesanan berhasil dibatalkan');
  } catch (error) {
    console.error('Gagal membatalkan booking:', error.message);
    alert('Gagal membatalkan pemesanan. Silakan coba lagi nanti.');
  }
}