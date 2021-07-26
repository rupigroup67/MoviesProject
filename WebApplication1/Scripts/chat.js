// FireBase
$(document).ready(function () {
    // init msgArray
    waitingForTheReplyToBeAllowedOrCensored = false;
    msgArr = [];
    // init ref
    ref = firebase.database().ref("Messages");
    // enable chat textbox
    if (localStorage.loggedUser) $('#messageBody').prop('disabled', false);
});
// This function initiates all the event listeners needed for the chat section
const initChatListeners = () => {
    listenToNewMessages();
    listenToMessageChanges();
    listenToRemoveMessages();
    listenToEnterEnter()
}
// ------------------- Event Listeners Methods: -------------------- //
const listenToEnterEnter = () => {
    document.querySelector('#messageBody').addEventListener('keypress', function (e) {
        if (e.keyCode == 13 && !e.shiftKey) {
            if ($('#messageBody').val() != "")
                sendMessage($('#messageBody').val())
            e.preventDefault()
        }
    });
}
const listenToMessageChanges = () => {
    ref.child(tvShow.id).on("child_changed", snapshot => {
        let newMsg = snapshot.val();
        newMsg.msgId = snapshot.key;
        updateMsg(newMsg, snapshot.key);
    })
}
const listenToNewMessages = () => {
    ref.child(tvShow.id).on("child_added", snapshot => {
        msg = {
            msgId: snapshot.key,
            userId: snapshot.val().userId,
            tvShowId: snapshot.val().tvShowId,
            msgText: snapshot.val().msgText,
            parentMsgId: snapshot.val().parentMsgId,
            datetime: snapshot.val().datetime,
            likes: snapshot.val().likes,
            dislikes: snapshot.val().dislikes,
            replies: snapshot.val().replies
        }
        msgArr.push(msg);
        loadMsg(msg);
    })
}
const listenToRemoveMessages = () => {
    ref.child(tvShow.id).on("child_removed", snapshot => {
        msgArr = msgArr.filter(m => m.content != snapshot.val().msg);
        $(`#userComment-${snapshot.key}`).remove();

    })
}

// ------------------- Messages Related Methods: -------------------- //

// Event listener calls updateMsg() when a msg has been updated.
// This allows the server to update only the relevant msg and not all of them.
const updateMsg = (msg, msgId) => {
    // update likes
    document.querySelector("#comment-" + msgId + " .likesNum p").innerHTML = msg.likes?.length == undefined ? "0" : msg.likes.length;
    // update dislikes
    document.querySelector("#comment-" + msgId + " .dislikesNum p").innerHTML = msg.dislikes?.length == undefined ? "0" : msg.dislikes.length;
    // update text
    document.querySelector("#comment-" + msgId + " .userMsg").innerHTML = msg.msgText;

    // update like / dislike src
    document.querySelector("#comment-" + msgId + " .likesNum img").setAttribute("src", setLikeDislikeSrc(msg,"like"))
    document.querySelector("#comment-" + msgId + " .dislikesNum img").setAttribute("src", setLikeDislikeSrc(msg,"dislike"))


    // update user choice?
    $('#repliesTo-' + msgId).empty();
    if (msg.replies) {
        loadReplyMsgs(msg);
    }
}
// Add the functionality to the like/dislike message button
const likeMsg = (msgId) => {
    ref.child(tvShow.id).child(msgId).once("value", snapshot => {
        let likes = [];
        let dislikes = [];
        // check if the dislikes list has likes in it already and remove it if nesessito
        dislikes = snapshot.val().dislikes;
        if (dislikes && dislikes.includes(user.Id)) {
            dislikes = dislikes.filter(id => id !== user.Id);
            ref.child(tvShow.id).child(msgId).update({ 'dislikes': dislikes });
        }
        // if the aray is empty -> create new 
        if (snapshot.val().likes == undefined) {
            likes.push(user.Id);
        }
        // else, save the current array to manipulate it
        else {
            likes = snapshot.val().likes;
            // if the user id is already included in the data array -> needs to delete it
            if (likes.includes(user.Id)) {
                likes = likes.filter(id => id !== user.Id)
            }
            // else push the new user id to the array
            else {
                // check if the dislikes list has likes in it already and remove it if nesessito
                likes.push(user.Id);
            }
        }
        ref.child(tvShow.id).child(msgId).update({ 'likes': likes });
    })
}
const dislikeMsg = (msgId) => {
    ref.child(tvShow.id).child(msgId).once("value", snapshot => {
        let dislikes = [];
        let likes = [];
        // check if the likes list has likes in it already and remove it if nesessito
        likes = snapshot.val().likes;
        if (likes && likes.includes(user.Id)) {
            likes = likes.filter(id => id !== user.Id);
            ref.child(tvShow.id).child(msgId).update({ 'likes': likes });
        }
        // if the aray is empty -> create new 
        if (snapshot.val().dislikes == undefined) {
            dislikes.push(user.Id);
        }
        // else, save the current array to manipulate it
        else {
            dislikes = snapshot.val().dislikes;
            // if the user id is already included in the data array -> needs to delete it
            if (dislikes.includes(user.Id))
                dislikes = dislikes.filter(id => id !== user.Id);
            // else push the new user id to the array
            else {

                dislikes.push(user.Id);
            }
        }
        ref.child(tvShow.id).child(msgId).update({ 'dislikes': dislikes });
    })
}

// Event listener calls loadMsg() when detect any change in the messages' fields inside firebase and prints the changes 
const loadMsg = (msg) => {
    console.log("loadMsg")
    console.log(msg)
    let chatDiv = $("#chatmessages");
    let HTMLString;
    if (!localStorage.loggedUser) {
        HTMLString = `<div id="userComment-${msg.msgId}" >
                            <div id="comment-${msg.msgId}" class="comment" title=${msg.datetime}>
                                <img id="img-${msg.msgId}" src="" alt="">
                                <div class="msgs">
                                    <p class="userNickname-${msg.msgId}"></p>
                                    <textarea type="text" class="userMsg" id="text-${msg.msgId}" disabled>${msg.msgText}</textarea>
                                </div>
                            </div>
                            <div id="repliesTo-${msg.msgId}" class="replies"></div>
                      </div>`
    }

    else {
        HTMLString = `<div id="userComment-${msg.msgId}" >
                        <div id="comment-${msg.msgId}" class="comment" title=${msg.datetime}>
                            <img id="img-${msg.msgId}" src="" alt="">
                            <div class="msgs">
                                <p class="userNickname-${msg.msgId}"></p>
                                <textarea type="text" class="userMsg" id="text-${msg.msgId}" disabled>${msg.msgText}</textarea>
                                <hr>
                                <div class="acceptChanges-${msg.msgId} accept">
                                    <button onclick="saveMsgText('${msg.msgId}')">Save changes</button>
                                </div>
                                <div class="reactions">
                                    <div class="replyMsg">
                                            <img onclick="replyMsg('${msg.msgId}')" data-msgId="${msg.msgId}" src="https://img.icons8.com/ios-filled/50/000000/response.png" title="reply"/>
                                        </div>`;
        if (msg.userId == user.Id)
            HTMLString += ` <div class="deleteMsg">
                                        <img title="delete" onclick="deleteMsg('${msg.msgId}')" data-msgId="${msg.msgId}" src="https://img.icons8.com/ios-glyphs/30/000000/delete-message.png"/>                     
                                    </div>
                                    <div class="editMsg">
                                        <img title="edit" onclick="editMsg('${msg.msgId}')" data-msgId="${msg.msgId}" src="https://img.icons8.com/pastel-glyph/64/000000/edit-message--v1.png"/>
                                    </div>`
        HTMLString += ` <div class="likesNum">
                                        <img data-like="${"likeState"}" title="like" data-msgId="${msg.msgId}" onclick="likeMsg('${msg.msgId}')" src=${setLikeDislikeSrc(msg, "like")}/>
                                        <p>${msg.likes == undefined ? 0 : msg.likes.length}</p>
                                    </div>
                                    <div class="dislikesNum">
                                        <img data-dislike="${"dislikeState"}" title="dislike" data-msgId="${msg.msgId}" onclick="dislikeMsg('${msg.msgId}')" src=${setLikeDislikeSrc(msg, "dislike")}/>
                                        <p>${msg.dislikes == undefined ? 0 : msg.dislikes.length}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="repliesTo-${msg.msgId}" class="replies"></div>
                    </div>`;
    }
    chatDiv.append(HTMLString);
    textAreaAdjust(msg.msgId, 'comment');
    picturesRef = firebase.database().ref("Pictures").child(msg.userId);
    picturesRef.once("value", snapshot => {
        $('.userNickname-' + msg.msgId).text(`${snapshot.val().Nickname}:`);
        $('.comment #img-' + msg.msgId).attr('src', snapshot.val().Link);
    });
    if (msg.replies) {
        loadReplyMsgs(msg);
    }
    PushScrollToBottom();
}
// Add a reply box when the user clicks on "reply" button
const replyMsg = (msgId) => {
    // create an empty msg
    let repliesLen = $('#repliesTo-' + msgId).children().length;
    let HTMLReply = `<div id="msg-${msgId}-reply-${repliesLen}" class="reply"}>
                        <img id="img-${repliesLen}" src="" alt="">
                        <div class="msgs">
                            <p class="deleteButton" onclick="removeReply('${msgId}' , '${repliesLen}')">&times</p>
                            <p class="userNickname-${repliesLen}"></p>
                            <textarea type="text" class="userMsg" id="text-${repliesLen}">${""}</textarea>
                            <hr>
                            <div class="reactions"></div>
                        </div>
                    </div>`
    $('#repliesTo-' + msgId).append(HTMLReply);
    enableReplyCSS(msgId, repliesLen);
    // event listener for Enter press
    document.querySelector('#repliesTo-' + msgId + ' #text-' + repliesLen).addEventListener('keypress', function (e) {
        if (e.keyCode == 13 && !e.shiftKey && !waitingForTheReplyToBeAllowedOrCensored) {
            waitingForTheReplyToBeAllowedOrCensored = true;
            let myHeaders = new Headers();
            myHeaders.append("apikey", "PZrRM9kr9w9dLnFpplZ6pxso57TDsCZH");
            let requestOptions = {
                method: 'POST',
                redirect: 'follow',
                headers: myHeaders,
                body: $('#repliesTo-' + msgId + ' #text-' + repliesLen).val().trim()
            };
            fetch("https://api.promptapi.com/bad_words?censor_character=*", requestOptions)
                .then(response => response.text())
                .then(result => JSON.parse(result))
                .then(result => {
                    console.log(result);
                    if (result.bad_words_total > 0) {
                        alert("You have been censored!");
                        removeReply(msgId, repliesLen, true);
                        blockUserTemp(1);
                    }
                    else {
                        sendReply(msgId, $('#repliesTo-' + msgId + ' #text-' + repliesLen));

                    }
                    waitingForTheReplyToBeAllowedOrCensored = false;
                })
                .catch(error => console.log('error', error));
            e.preventDefault()
        }
    });
}
// Edit the msg's text if the user wants to change his reaction inside the chat
const editMsg = (msgId) => {
    ref.child(tvShow.id).child(msgId).once('value', snapshot => {
        if (user.Id == snapshot.val().userId)
            $(`#text-${msgId}`).prop('disabled', false);
        $(`#comment-${msgId} .reactions`).hide();
        $(`.acceptChanges-${msgId}`).show();
        $('#comment-' + msgId + ' textarea').css('backgroundColor', 'rgba(255, 255, 255, 0.1)');
    });
}
// After the user edits his msg, the saveMsgText() updates the text inside firebase
const saveMsgText = (msgId) => {
    $(`.acceptChanges-${msgId}`).hide();
    $(`#comment-${msgId} .reactions`).show();
    $(`#text-${msgId}`).prop('disabled', true);
    $('#comment-' + msgId + ' textarea').css('backgroundColor', 'transparent');
    let text = $(`#text-${msgId}`).val().trim();
    ref.child(tvShow.id).child(msgId).once('value', snapshot => {
        if (text === "") {
            console.log('text is empty');
            $(`#text-${msgId}`).val(snapshot.val().msgText);
            return;
        }
        else if (text == snapshot.val().msgText) {
            console.log('text is the same');
            $(`#text-${msgId}`).val(snapshot.val().msgText);
            return;
        }
        else ref.child(tvShow.id).child(msgId).update({ 'msgText': text });
    });
    textAreaAdjust(msgId);
}
// A user can delete his own msg if he wants, by clicking on the "remove-msg" button.
// This function deletes the msg from the chat, as well as its replies, and removes it from the firebase.
const deleteMsg = (msgId) => {
    ref.child(tvShow.id).child(msgId).once('value', snapshot => {
        if (user.Id == snapshot.val().userId)
            ref.child(tvShow.id).child(msgId).remove();
    });
}
// This function sends the msg each user creates right to the firebase
// Before inserting the msg, it passes throught an external API that sencors the text if the user used inappropriate text and deletes the whole msg.
// If the user has found using bad language for more than 3 times, he will be punished.
const sendMessage = (text) => {
    $('#sendBTN').attr('src', "./images/sendBlack.png")
    $('#sendBTN').attr('disabled', true);
    $('#sendBTN').css('pointerEvents', 'none');
    let myHeaders = new Headers();
    myHeaders.append("apikey", "PZrRM9kr9w9dLnFpplZ6pxso57TDsCZH");
    let requestOptions = {
        method: 'POST',
        redirect: 'follow',
        headers: myHeaders,
        body: text.trim()
    };
    document.getElementById("messageBody").value = "";
    fetch("https://api.promptapi.com/bad_words?censor_character=*", requestOptions)
        .then(response => response.text())
        .then(result => JSON.parse(result))
        .then(result => {
            if (result.bad_words_total > 0) {
                alert("You have been censored!")
                blockUserTemp(1);
                // button to blue!
                return;
            }
            msg = {
                userId: user.Id,
                tvShowId: tvShow.id,
                msgText: result.censored_content == undefined ? text.trim() : result.censored_content.trim(),
                datetime: new Date().toJSON(),
            }
            ref.child(tvShow.id).push().set(msg);
            // document.getElementById("messageBody").value = "";
        })
        .catch(error => console.log('error', error));
}
// Makes sure the user doesn't send empty msgs
const checkMessage = (text) => {
    // document.getElementById("messageBody").innerHTML = document.getElementById("messageBody").innerHTML.trim()
    if ((text.trim()).length <= 0 && sendBTN.getAttribute('src') == "./images/sendColor.png") {
        sendBTN.setAttribute('src', "./images/sendBlack.png");
        sendBTN.style.pointerEvents = "none";
    }
    else if ((text.trim()).length > 0 && sendBTN.getAttribute('src') == "./images/sendBlack.png") {
        sendBTN.setAttribute('src', "./images/sendColor.png");
        sendBTN.style.pointerEvents = "auto";
    }
}

// ------------------- Replies Related Methods: -------------------- //

// Add the functionality to the like/dislike reply button
const likeReply = (parentId, index) => {
    ref.child(tvShow.id).child(parentId).child('replies').child(index).once("value", snapshot => {
        let likes = [];
        let dislikes = [];
        // check if the dislikes list has likes in it already and remove it if nesessito
        dislikes = snapshot.val().dislikes;
        if (dislikes && dislikes.includes(user.Id)) {
            dislikes = dislikes.filter(id => id !== user.Id);
            ref.child(tvShow.id).child(parentId).child('replies').child(index).update({ 'dislikes': dislikes });
        }
        // if the aray is empty -> create new 
        if (snapshot.val().likes == undefined) {
            likes.push(user.Id);
        }
        // else, save the current array to manipulate it
        else {
            likes = snapshot.val().likes;
            // if the user id is already included in the data array -> needs to delete it
            if (likes.includes(user.Id)) {
                likes = likes.filter(id => id !== user.Id)
            }
            // else push the new user id to the array
            else {
                // check if the dislikes list has likes in it already and remove it if nesessito
                likes.push(user.Id);
            }
        }
        ref.child(tvShow.id).child(parentId).child('replies').child(index).update({ 'likes': likes });
    })
}
const dislikeReply = (parentId, index) => {
    ref.child(tvShow.id).child(parentId).child('replies').child(index).once("value", snapshot => {
        let dislikes = [];
        let likes = [];
        // check if the likes list has likes in it already and remove it if nesessito
        likes = snapshot.val().likes;
        if (likes && likes.includes(user.Id)) {
            likes = likes.filter(id => id !== user.Id);
            ref.child(tvShow.id).child(parentId).child('replies').child(index).update({ 'likes': likes });
        }
        // if the aray is empty -> create new 
        if (snapshot.val().dislikes == undefined) {
            dislikes.push(user.Id);
        }
        // else, save the current array to manipulate it
        else {
            dislikes = snapshot.val().dislikes;
            // if the user id is already included in the data array -> needs to delete it
            if (dislikes.includes(user.Id))
                dislikes = dislikes.filter(id => id !== user.Id);
            // else push the new user id to the array
            else {

                dislikes.push(user.Id);
            }
        }
        ref.child(tvShow.id).child(parentId).child('replies').child(index).update({ 'dislikes': dislikes });
    })
}
// loadReplyMsgs() get's a specific msg as an argument and prints all its replies
const loadReplyMsgs = (msg) => {
    if (msg.replies)
        msg.replies.forEach((reply, index) => {
            let HTMLReply = `<div id="msg-${msg.msgId}-reply-${index}" class="reply"}>
                            <img id="img-${index}" src="" alt="">
                            <div class="msgs">
                                <p class="userNickname-${index}"></p>
                                <textarea type="text" class="userMsg" id="text-${index}" disabled></textarea>`
            if (localStorage.loggedUser) HTMLReply +=
                `<hr>
                                <div class="msg-${msg.msgId}-acceptChanges-${index} accept">
                                    <button onclick="saveReplyText('${msg.msgId}', '${index}')">Save changes</button>
                                </div>
                                <div class="reactions"></div>
                            </div>
                        </div>`
            $('#repliesTo-' + msg.msgId).append(HTMLReply);
        });
    msg.replies.forEach((reply, index) => {
        picturesRef = firebase.database().ref("Pictures").child(reply.userId);
        picturesRef.once("value", snapshot => {
            $('#msg-' + msg.msgId + '-reply-' + index + ' .userNickname-' + index).html(`${snapshot.val().Nickname}:`);
            $('#msg-' + msg.msgId + '-reply-' + index + ' #img-' + index).attr('src', snapshot.val().Link);
            $('#msg-' + msg.msgId + '-reply-' + index + ' textarea').val(reply.msgText);
            if (localStorage.loggedUser && user.Id == reply.userId)
                $('#msg-' + msg.msgId + '-reply-' + index + ' .reactions').append(
                    `<div class="deleteMsg">
                    <img title="delete" onclick="removeReply('${msg.msgId}' , '${index}')" src="https://img.icons8.com/ios-glyphs/30/000000/delete-message.png"/>                     
                </div>
                <div class="editMsg">
                    <img title="edit" onclick="editReply('${msg.msgId}','${index}')" src="https://img.icons8.com/pastel-glyph/64/000000/edit-message--v1.png"/>
                </div>`)
            $('#msg-' + msg.msgId + '-reply-' + index + ' .reactions').append(
                `<div class="likesNum">
                    <img data-like="${"likeState"}" title="like" data-replyIndex="${index}" onclick="likeReply('${msg.msgId}','${index}')" src=${setLikeDislikeSrc(reply,"like")}/>
                    <p>${reply.likes == undefined ? 0 : reply.likes.length}</p>
                </div>
                <div class="dislikesNum">
                    <img data-dislike="${"dislikeState"}" title="dislike" data-replyIndex="${index}" onclick="dislikeReply('${msg.msgId}','${index}')" src=${setLikeDislikeSrc(reply,"dislike")}/>
                    <p>${reply.dislikes == undefined ? 0 : reply.dislikes.length}</p>
                </div>`);
        });
        textAreaAdjust(msg.msgId, 'reply', index);
    })
}
// Adding css to the replies to make it look good and feel like a reply to a specific message
const enableReplyCSS = (msgId, repliesLen) => {
    $(`#msg-${msgId}-reply-${repliesLen}` + ' textarea').focus();
    PushScrollToBottom();
    picturesRef = firebase.database().ref("Pictures").child(user.Id);
    picturesRef.once("value", snapshot => {
        $(`#comment-${msgId} .replyMsg img`).css('pointerEvents', 'none');
        $('#repliesTo-' + msgId + ' .userNickname-' + repliesLen).text(`${snapshot.val().Nickname}:`);
        $('#repliesTo-' + msgId + ' #img-' + repliesLen).attr('src', snapshot.val().Link);
        $('#repliesTo-' + msgId + ' #text-' + repliesLen).prop('disabled', false);
        $('#repliesTo-' + msgId + ' #text-' + repliesLen).css('backgroundColor', 'rgba(255, 255, 255, 0.1)');
    });
    textAreaAdjust(msgId, 'reply', repliesLen);
}
// Creates a reply object and pass it to the firebase right into the specific msg's replies list
const sendReply = (parentMsgId, textarea) => {
    $(`#comment-${parentMsgId} .replyMsg img`).css('pointerEvents', 'all');
    $(`#msg-${parentMsgId}-reply-${$('#repliesTo-' + parentMsgId).children().length - 1}` + ' .deleteButton').remove();
    $(`#msg-${parentMsgId}-reply-${$('#repliesTo-' + parentMsgId).children().length - 1}` + ' .reactions').append(
        `<div class="deleteMsg">
            <img title="delete" onclick="removeReply('${parentMsgId}','${$('#repliesTo-' + parentMsgId).children().length - 1}')" src="https://img.icons8.com/ios-glyphs/30/000000/delete-message.png"/>                     
        </div>
        <div class="editMsg">
            <img title="edit" onclick="editReply('${parentMsgId}','${$('#repliesTo-' + parentMsgId).children().length - 1}')" src="https://img.icons8.com/pastel-glyph/64/000000/edit-message--v1.png"/>
        </div>
        <div class="likesNum">
            <img title="like" data-replyIndex=${$('#repliesTo-' + parentMsgId).children().length - 1} onclick="likeReply('${parentMsgId}','${$('#repliesTo-' + parentMsgId).children().length - 1}')" src=${"./images/likeBlack.png "}/>
            <p>0</p>
        </div>
        <div class="dislikesNum">
            <img title="dislike" data-replyIndex=${$('#repliesTo-' + parentMsgId).children().length - 1} onclick="dislikeReply('${parentMsgId}','${$('#repliesTo-' + parentMsgId).children().length - 1}')" src=${"./images/dislikeBlack.png "}/>
            <p>0</p>
        </div>`);
    textarea.prop('disabled', true);
    textarea.css('backgroundColor', 'transparent');
    // create the message object
    let msg = {
        userId: user.Id,
        tvShowId: tvShow.id,
        msgText: textarea.val().trim(),
        datetime: new Date().toJSON(),
    }
    let repliesList = [];
    ref.child(tvShow.id).child(parentMsgId).once('value', snapshot => {
        if (snapshot.val().replies) {
            repliesList = snapshot.val().replies;
            repliesList.push(msg);
        }
        else repliesList = [msg];
    })
    ref.child(tvShow.id).child(parentMsgId).update({ 'replies': repliesList });
}
// Remove the reply from the chat if the user desires. Also remove it from the firebase msg's replies list
const removeReply = (msgId, index, isNewReply = false) => {
    $(`#msg-${msgId}-reply-${index}`).remove();
    $(`#comment-${msgId} .replyMsg img`).css('pointerEvents', 'all');
    if (!isNewReply) {
        ref.child(tvShow.id).child(msgId).child('replies').child(index).remove();
    }
}
// Edit the reply's text if the user wants to change his reaction inside the chat
const editReply = (parentId, index) => {
    ref.child(tvShow.id).child(parentId).child('replies').child(index).once('value', snapshot => {
        if (user.Id == snapshot.val().userId) {
            $(`#msg-${parentId}-reply-${index} textarea`).prop('disabled', false);
            $(`#msg-${parentId}-reply-${index} .reactions`).hide();
            $(`#msg-${parentId}-reply-${index} .accept`).show();
            $(`#msg-${parentId}-reply-${index} textarea`).css('backgroundColor', 'rgba(255, 255, 255, 0.1)');
        }
    });
}
// After the user edits his reply, the saveReplyText() updates the text inside firebase
const saveReplyText = (parentId, index) => {
    $(`#msg-${parentId}-reply-${index} .accept`).hide();
    $(`#msg-${parentId}-reply-${index} .reactions`).show();
    $(`#msg-${parentId}-reply-${index} textarea`).prop('disabled', true);
    $(`#msg-${parentId}-reply-${index} textarea`).css('backgroundColor', 'transparent');
    let text = $(`#msg-${parentId}-reply-${index} textarea`).val().trim();
    ref.child(tvShow.id).child(parentId).child('replies').child(index).once('value', snapshot => {
        if (text === "") {
            console.log('text is empty');
            $(`#msg-${parentId}-reply-${index} textarea`).val(snapshot.val().msgText);
            return;
        }
        else if (text == snapshot.val().msgText) {
            console.log('text is the same');
            $(`#msg-${parentId}-reply-${index} textarea`).val(snapshot.val().msgText);
            return;
        }
        else {
            let myHeaders = new Headers();
            myHeaders.append("apikey", "PZrRM9kr9w9dLnFpplZ6pxso57TDsCZH");
            let requestOptions = {
                method: 'POST',
                redirect: 'follow',
                headers: myHeaders,
                body: text.trim()
            };
            fetch("https://api.promptapi.com/bad_words?censor_character=*", requestOptions)
                .then(response => response.text())
                .then(result => JSON.parse(result))
                .then(result => {
                    if (result.bad_words_total > 0) {
                        alert("You have been censored!")
                        blockUserTemp(1);
                    }
                    else {
                        ref.child(tvShow.id).child(parentId).child('replies').child(index)
                            .update({ 'msgText': result.censored_content == undefined ? text.trim() : result.censored_content.trim() });
                    }
                })
                .catch(error => console.log('error', error));
        }
    });
    textAreaAdjust(msgId);
}


// ------------------- Additional Methods: -------------------- //

// When rendering the msg or reply to the screen, this function makes sure each textbox gets its own height
const textAreaAdjust = (msgId, kind, index = 0) => {
    if (kind == 'comment') {
        document.querySelector(`#text-${msgId}`).style.height = "1px";
        document.querySelector(`#text-${msgId}`).style.height = (-5 + document.querySelector(`#text-${msgId}`).scrollHeight) + "px";
    }
    else {
        let reply = document.querySelector(`#msg-${msgId}-reply-${index} textarea`);
        reply.style.height = "1px";
        let replyWantedLength = reply.scrollHeight;
        reply.style.height = -10 + replyWantedLength + 'px';
    }
}
// PushScrollToBottom function makes sure the user sees the latest messages and replies first and pushes the chat field to the bottom
const PushScrollToBottom = () => {
    let chatDiv = document.querySelector("#chatmessages");
    chatDiv.scrollTop = chatDiv.scrollHeight;
}
// Checks if the message sent has any bad words in it, using external API
const censorText = async (text) => {
    let myHeaders = new Headers();
    myHeaders.append("apikey", "PZrRM9kr9w9dLnFpplZ6pxso57TDsCZH");
    let requestOptions = {
        method: 'POST',
        redirect: 'follow',
        headers: myHeaders,
        body: text
    };
    return await fetch("https://api.promptapi.com/bad_words?censor_character=*", requestOptions)
        .then(response => response.text())
        .then(result => {
            return JSON.parse(result)
        })
        .catch(error => console.log('error', error));
}
// If the user found guilty 3 times, he will be punished. Extending sendMessage function
const blockUserTemp = (badWordsNum) => {
    tempRef = firebase.database().ref("Pictures").child(user.Id);
    // alert("Due to voilations of chat you have been temporary suspended (1 hour)")
    // get the current BadWordCounter
    tempRef.once("value", snapshot => {
        if (snapshot.val().BadWordsCounter != undefined) {
            badWordsNum += snapshot.val().BadWordsCounter;
        }
    })
    if (badWordsNum > 2) {
        // suspend the user for 1 hour!
        Date.prototype.addHours = function (h) {
            this.setHours(this.getHours() + h);
            return this;
        }
        alert("Due to voilations of chat you have been temporary suspended (1 hour)")
        tempRef.update({
            'BadWordsCounter': 0,
            'Suspend': new Date().addHours(1)
        });
        localStorage.clear();
        window.location.href = "homepage.html";
    }
    else {
        alert("Beware, the message you wrote was not sent due to abusive words. After 3 warnings, you will receive an hour suspention, until now you have recieved " + badWordsNum + " warnings ")
        tempRef.update({ 'BadWordsCounter': badWordsNum });
    }
}
// return the correct src per input (like or dislike)
const setLikeDislikeSrc = (msg, type) => {
    if (type == "like") {
        if (msg.likes)
            return msg.likes.includes(user.Id) ? "./images/likeColor.png " : "./images/likeBlack.png ";
        else
            return "./images/likeBlack.png "

    }
    //dislike
    else if (msg.dislikes) {
        return msg.dislikes.includes(user.Id) ? "./images/dislikeColor.png " : "./images/dislikeBlack.png ";
    }
    else
        return "./images/dislikeBlack.png ";
}