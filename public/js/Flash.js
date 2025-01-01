

setTimeout(() => {
    const successAlert = document.getElementById('success_msg_id');
    console.log(successAlert);
    if (successAlert) {
        successAlert.style.display = 'none';
        
    }
}, 2000); 

setTimeout(() => {
    const errorAlert = document.getElementById('error_msg_id');
    if (errorAlert) {
        errorAlert.style.display = 'none';
    }
}, 2000);


// document.addEventListener('DOMContentLoaded', () => {
//     // Add click event to all like buttons
//     document.querySelectorAll('.like-btn').forEach(button => {
//         button.addEventListener('click', async () => {
//             const postId = button.getAttribute('data-post-id');
//             const userId = button.getAttribute('data-user-id');
            
//             try {
//                 const response = await fetch(`/like/${postId}`, {
//                     method: 'POST',
//                     headers: {
//                         'Content-Type': 'application/json',
//                     },
//                     body: JSON.stringify({ userId }),
//                 });

//                 if (response.ok) {
//                     const data = await response.json();
//                     // Update likes count and button text
//                     button.nextElementSibling.textContent = `${data.likes} likes`;
//                     button.textContent = data.isLiked ? "Unlike" : "Like";
//                 } else {
//                     console.error('Error liking post');
//                 }
//             } catch (error) {
//                 console.error('Error:', error);
//             }
//         });
//     });
// });
