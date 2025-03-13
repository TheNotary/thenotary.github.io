
function lambdaPoke() {
    // Thank user for the poke
    showToast("Poke Sent, Thanks!");

    // Send ajax to my lambda url...
    //
    // 1. deploy simple golang service to recieve POST messages (pokes) that will
    // be sent to a messaging platform. https://github.com/bwmarrin/discordgo should be fine
    //
    // 2. configure the lambda to forward the POST my k8s process via the correct
    // IPV6 address and return the response from the k8s service.
    //
    // 3. print the response from the lambda to the console
}


function showToast(message) {
    toast = document.getElementById('lambda-toast');
    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 1500); // Toast disappears after 3 seconds
}
