// Debug utility to inspect the raw API response for friends endpoint
export const debugFriendsAPI = async () => {
  try {
    console.log("🔍 Making direct fetch to friends API...");
    
    // Get token from localStorage (assuming it's stored there)
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    
    if (!token) {
      console.error("❌ No token found in localStorage");
      return;
    }

    const response = await fetch('/api/users/friends', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    console.log("📡 Response status:", response.status);
    console.log("📡 Response headers:", Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      console.error("❌ API Error:", response.statusText);
      return;
    }

    const rawData = await response.text();
    console.log("📋 Raw response body:", rawData);

    try {
      const jsonData = JSON.parse(rawData);
      console.log("📊 Parsed JSON data:", jsonData);
      
      if (Array.isArray(jsonData)) {
        console.log(`📈 Found ${jsonData.length} friends`);
        jsonData.forEach((friend: Record<string, unknown>, index: number) => {
          console.log(`👥 Friend ${index + 1}:`, {
            id: friend.id,
            displayName: friend.displayName,
            email: friend.email,
            devices: friend.devices,
            deviceCount: Array.isArray(friend.devices) ? friend.devices.length : 0,
            allProperties: Object.keys(friend)
          });
        });
      } else {
        console.error("❌ Response is not an array:", typeof jsonData);
      }
    } catch (parseError) {
      console.error("❌ Failed to parse JSON:", parseError);
    }

  } catch (error) {
    console.error("❌ Network error:", error);
  }
};

// Add to window for easy access in dev tools
if (typeof window !== 'undefined') {
  (window as unknown as Record<string, unknown>).debugFriendsAPI = debugFriendsAPI;
}