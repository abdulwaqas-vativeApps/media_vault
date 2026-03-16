
'use client';

import { useEffect } from 'react';

export default function Login() {

  // for attach google sign in button to div#googleBtn, we need to wait for google script to load
  useEffect(() => { 
    /* global google */
    if (window.google) {
      google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse
      });

      google.accounts.id.renderButton(
        document.getElementById('googleBtn'),
        { theme: 'outline', size: 'large' }
      );
    }
  }, []);

  // GOOGLE LOGIN
  const handleGoogleResponse = async (response) => {
    const idToken = response.credential;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/google`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      }
    );

    const data = await res.json();
    localStorage.setItem('jwt', data.token);

    console.log('✅ Logged in');
  };

  // IMAGE SELECT → PRESIGNED URL → PUT TO S3
  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      //  Presigned URL backend se lo
      const formData = new FormData();
      formData.append("image", file); // 👈 IMPORTANT
      formData.append("mime_type", file.type);
      formData.append("file_name", file.name);
      formData.append("asset_type", "Profile_Picture");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/profile/media-assets/presigned-url`,
        {
          method: "POST",
          body: formData, 
        }
      );

      const data = await res.json();

      console.log('=============upload url==============');
      console.log(data);
      console.log(file);
      console.log('=============upload url==============');

      //  PUT request → DIRECT S3
      if (data.data.uploadUrl) {
        await fetch(data.data.uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": file.type
          },
          body: file
        });
      }

      console.log(" Image uploaded to S3");


      // (STEP-3 baad mein: backend ko key/url save karwao)

    } catch (err) {
      console.error(" Upload failed", err);
    }
  };

  return (
    <div style={{ marginTop: '100px', textAlign: 'center' }}>
      <h1 className='text-3xl font-bold underline'>Media Vault 2.O</h1>
      <h1>Login</h1>

      {/* Google Button */}
      <div id="googleBtn"></div>

      <br /><br />

      {/* Image Upload */}
      <input
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
      />

      {/* Google Script */}
      <script
        src="https://accounts.google.com/gsi/client"
        async
        defer
      ></script>
    </div>
  );
}