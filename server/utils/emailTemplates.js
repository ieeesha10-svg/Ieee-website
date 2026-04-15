// This file holds all your static HTML parts

const getEmailFooter = () => {
  return `
    <br><br>
    <div style="font-family: Arial, sans-serif; font-size: 14px; color: #333; border-top: 1px solid #ddd; padding-top: 20px;">
      <table>
        <tbody>
          <tr>
            <td style="padding-right: 15px; vertical-align: top;">
              <img
                src="https://lh4.googleusercontent.com/-Esrvsr7gZa9Y8E-6yrov9kY4XIDKrQWljMUDrJQt_MtpxVpz9XORLHAEx1ICkNj3z-lnwf2ECCih96pJIKdd62SoyiYp6hCyFMWSEXq4IUd50Vb8sMwE9pGtIgQGTlXqK7GPzx8" 
                              alt="IEEE Logo" width="120" style="display:block;">
              </td>

            <td style="border-left: 2px solid #000; padding: 0 15px;"></td>

            <td style="padding-left: 15px; vertical-align: top;">
              <p style="margin: 0; font-size: 16px;"><strong>IEEE El Shorouk Academy Student Branch</strong></p>
              <p style="margin: 0 0 10px 0; color: #666; font-size: 12px;">Nonprofit Organization</p>
              
              <p style="margin: 2px 0;"><strong>Chairperson:</strong> Alaa Mohamed</p>
              <p style="margin: 2px 0;"><strong>Vice-Chairperson:</strong> Ali El sayed</p>
              <p style="margin: 2px 0;"><strong>Treasurer:</strong> Reem Hendawy</p>
              <p style="margin: 2px 0;"><strong>Secretary:</strong> Youssif Hany</p>
              
              <div style="margin-top: 10px; font-size: 12px;">
                <p style="margin: 2px 0;">HR Dept: <a href="mailto:ieee.sha.hr@gmail.com" style="color: #00629B; text-decoration: none;">ieee.sha.hr@gmail.com</a></p>
                <p style="margin: 2px 0;">Branch Mail: <a href="mailto:ieee.sha.10@gmail.com" style="color: #00629B; text-decoration: none;">ieee.sha.10@gmail.com</a></p>
                <p style="margin: 2px 0; color: #555;">El-Shorouk City, Palms District, Cairo, Egypt 11837</p>
              </div>

              <p style="margin-top: 10px;">
                <a href="https://www.facebook.com/IEEE.ElShoroukAcademy.SB/" style="margin-right: 10px; color: #3b5998; text-decoration: none;">Facebook</a> |
                <a href="https://www.linkedin.com/company/ieee-sha-sb/" style="margin: 0 10px; color: #0077b5; text-decoration: none;">LinkedIn</a> |
                <a href="https://www.instagram.com/ieee.sha.sb/" style="margin-left: 10px; color: #E1306C; text-decoration: none;">Instagram</a>
              </p>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `;
};

module.exports = { getEmailFooter };