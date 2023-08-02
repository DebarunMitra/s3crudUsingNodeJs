$(document).ready(() => {
    fetchFiles();
})

function fetchFiles(){
    $.ajax({
        url: '/files',
        method: 'GET',
        success: function(data){
            $("#fileTableBody").empty();

            data.forEach(file => {
                let row = `<tr>
                        <td>${file.name}</td>
                        <td>${file.url}</td>
                        <td>
                            <a href="/files/${encodeURIComponent(file.name)}/download" class="btn btn-primary download-button">Download</a>
                            <button class="btn btn-danger delete-button" data-name="${file.name}">Delete</button>
                         </td>
                    </tr>`;

                    $("#fileTableBody").append(row);
            });

            attachDownloadHandlers();

            attachDeleteHandlers();
        },
        error: function(error){
            console.log("Error Fetching Files", error);
        }
    })
}

function downloadFile(url){
     let link = document.createElement('a');
     link.href = url;
     link.setAttribute("download", "");

     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
}

function attachDownloadHandlers(){
    $(".download-button").click(function(e){
        e.preventDefault();

        let downloadURL = $(this).attr('href');
        downloadFile(downloadURL);
    })
}

function deleteFile(fileName){
    $.ajax({
        url: '/file/'+fileName,
        method: 'DELETE',
        success: function(){
            fetchFiles()
        },
        error: function(error){
            console.log("Error Deleteing FIles");
        }
    })
}

function attachDeleteHandlers(){
    $(".delete-button").click(function(){
        let fileName = $(this).data("name");

        if(confirm("Are You Sure Yo Want To Delete The File "+fileName)){
            deleteFile(fileName);
        }
    })
}