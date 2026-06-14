const form = document.getElementById("applyForm");

form.addEventListener("submit", function(e){

    e.preventDefault();

    const username =
    document.getElementById("username").value;

    const reason =
    document.getElementById("reason").value;

    const result =
    document.getElementById("result");

    result.innerHTML =
    `
    申请已提交<br>
    申请邮箱：
    <b>${username}@nanocat.xin</b>
    `;

    console.log({
        username,
        reason
    });

    form.reset();

});