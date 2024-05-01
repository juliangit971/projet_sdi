$(function () {


    // Like manager
    $(document).on('click', '.like_button', function () {
        
        const likedStatus = $(this).attr('id').split('_').pop();
        const postID = $(this).attr('id').split('_').slice(0,2).join('_');

        console.log(likedStatus);
        if (likedStatus == "unclicked") {    // Si on Like le post
            $.ajax({
                url: `/api/post-interraction/${postID}/like`,
                type: 'GET',
                success: (res) => {
                    
                    if (res.success) {
                        $(`#${postID}_like_button_unclicked`).attr('src', `/medias/website/common/liked.png`)
                        $(`#${postID}_like_button_unclicked`).attr('id', `${postID}_like_button_clicked`)
                        const likeCount = Number($(`#${postID}_like_count`).text()) + 1
                        $(`#${postID}_like_count`).text(likeCount)
                    } else {

                        if (res.logginStatus == false) {
                            console.log("[ERROR !] Not logged in to like post!");
                            window.location.replace(res.redirect);
                        } else {
                            console.log("[ERROR !] Unable to like post!");
                        }
                    }
                },
                error: () => {
                    console.log("[ERROR !] Unable to contact server!");
                }
            });

        } else {  // Si on Unlike le post

            $.ajax({
                url: `/api/post-interraction/${postID}/unlike`,
                type: 'GET',
                success: (res) => {
                    
                    if (res.success) {
                        $(`#${postID}_like_button_clicked`).attr('src', `/medias/website/common/like.png`)
                        $(`#${postID}_like_button_clicked`).attr('id', `${postID}_like_button_unclicked`)
                        const likeCount = Number($(`#${postID}_like_count`).text()) - 1
                        $(`#${postID}_like_count`).text(likeCount)
                    } else {

                        if (res.logginStatus == false) {
                            console.log("[ERROR !] Not logged in to unlike post!");
                            window.location.replace(res.redirect);
                        } else {
                            console.log("[ERROR !] Unable to unlike post!");
                        }
                    }
                },
                error: () => {
                    console.log("[ERROR !] Unable to contact server!");
                }
            });
        }

        
    });


    // Save manager
    $(document).on('click', '.save_button', function () {
        
        const likedStatus = $(this).attr('id').split('_').pop();
        const postID = $(this).attr('id').split('_').slice(0,2).join('_');

        console.log(likedStatus);
        if (likedStatus == "unclicked") {    // Si on Save le post
            $.ajax({
                url: `/api/post-interraction/${postID}/save`,
                type: 'GET',
                success: (res) => {
                    
                    if (res.success) {
                        $(`#${postID}_save_button_unclicked`).attr('src', `/medias/website/common/saved.png`)
                        $(`#${postID}_save_button_unclicked`).attr('id', `${postID}_save_button_clicked`)
                    } else {

                        if (res.logginStatus == false) {
                            console.log("[ERROR !] Not logged in to save post!");
                            window.location.replace(res.redirect);
                        } else {
                            console.log("[ERROR !] Unable to save post!");
                        }
                    }
                },
                error: () => {
                    console.log("[ERROR !] Unable to contact server!");
                }
            });

        } else {  // Si on Unsave le post

            $.ajax({
                url: `/api/post-interraction/${postID}/unsave`,
                type: 'GET',
                success: (res) => {
                    
                    if (res.success) {
                        $(`#${postID}_save_button_clicked`).attr('src', `/medias/website/common/save.png`)
                        $(`#${postID}_save_button_clicked`).attr('id', `${postID}_save_button_unclicked`)
                    } else {

                        if (res.logginStatus == false) {
                            console.log("[ERROR !] Not logged in to unsave post!");
                            window.location.replace(res.redirect);
                        } else {
                            console.log("[ERROR !] Unable to unsave post!");
                        }
                    }
                },
                error: () => {
                    console.log("[ERROR !] Unable to contact server!");
                }
            });
        }

        
    });
});