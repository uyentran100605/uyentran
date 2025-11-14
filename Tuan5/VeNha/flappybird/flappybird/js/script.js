$(function () {
  // Khai báo các object
  var container = $("#container");
  var bird = $("#bird");
  var pole = $(".pole");
  var pole_1 = $("#pole_1");
  var pole_2 = $("#pole_2");
  var score = $("#score");
  var level = $("#level"); // 🔹 NEW: thẻ hiển thị Level
  var best = parseInt(localStorage.getItem("best_score") || "0");
  $("#best_score").text("Best: " + best);

  // Chuyển các thông tin của object sang dạng số thực
  var container_width = parseInt(container.width());
  var container_height = parseInt(container.height());
  var pole_initial_position = parseInt(pole.css("right"));
  var pole_initial_height = parseInt(pole.css("height"));
  var bird_left = parseInt(bird.css("left"));
  var bird_height = parseInt(bird.height());

  // Tốc độ cột (vẫn giữ speed như cũ, interval sẽ thay đổi theo level)
  var speed = 10;

  // Một số trạng thái trong game
  var go_up = false;
  var score_updated = false;
  var game_over = false;

  // 🔹 NEW: biến cho Level + interval
  var current_level = 1;
  var interval_time = 40; // Level 1: 40ms
  var the_game = null; // sẽ lưu setInterval ở đây

  // Hàm bắt đầu game -> tạo game loop với interval hiện tại
  function playGame() {
    // Clear trước nếu có
    if (the_game) {
      clearInterval(the_game);
    }

    the_game = setInterval(function () {
      if (game_over) return;

      if (
        collision(bird, pole_1) ||
        collision(bird, pole_2) ||
        parseInt(bird.css("top")) <= 0 ||
        parseInt(bird.css("top")) > container_height - bird_height
      ) {
        stop_the_game(false); // thua
      } else {
        // Lấy vị trí hiện tại của ống nước
        var pole_current_position = parseInt(pole.css("right"));

        // Cập nhật điểm khi chim vượt qua 1 cặp ống
        if (pole_current_position > container_width - bird_left) {
          if (score_updated === false) {
        // Cập nhật điểm + high score
var newScore = parseInt(score.text()) + 1;
score.text(newScore);

// --- HIGH SCORE ---
var best = parseInt(localStorage.getItem("best_score") || "0");
if (newScore > best) {
    best = newScore;
    localStorage.setItem("best_score", best);
}

// Hiển thị high score lên giao diện
$("#best_score").text("Best: " + best);

            // Cộng 1 điểm
           
            score_updated = true;

            // 🔹 NEW: sau khi cập nhật điểm -> cập nhật Level
            updateLevel();
          }
        }

        // Kiểm tra các ống đã đi ra khỏi khung game
        if (pole_current_position > container_width) {
          var new_height = parseInt(Math.random() * 10);
          // Tạo chiều cao các ống nước ngẫu nhiên
          pole_1.css("height", pole_initial_height + new_height);
          pole_2.css("height", pole_initial_height - new_height);
          score_updated = false;
          pole_current_position = pole_initial_position;
        }

        // Di chuyển ống nước
        pole.css("right", pole_current_position + speed);

        // Nếu không điều khiển chú chim bay lên
        if (go_up === false) {
          go_down(); // Hàm di chuyển chú chim rơi xuống
        }
      }
    }, interval_time); // 🔹 dùng interval_time thay vì fix 40
  }

  // Khi nhấn phím
  $(document).keydown(function (e) {
    if (!game_over && e.key === "ArrowUp") {
      if (!go_up) {
        go_up = setInterval(up, 40);
      }
    }
  }); 

  // Khi thả phím
  $(document).keyup(function (e) {
    if (e.key === "ArrowUp") {
      clearInterval(go_up);
      go_up = false;
    }
  });

  // Khi nhấn vào Chơi game
  $("#play_btn").click(function () {
    playGame();
    $(this).hide();
  });

  // Hàm di chuyển chú chim rơi xuống
  function go_down() {
    bird.css("top", parseInt(bird.css("top")) + 10);
    bird.css("transform", "rotate(50deg)");
  }

  // Hàm di chuyển chú chim bay lên
  function up() {
    bird.css("top", parseInt(bird.css("top")) - 20);
    bird.css("transform", "rotate(-10deg)");
  }

  // 🔹 NEW: Cập nhật level theo điểm + chỉnh interval
  function updateLevel() {
    var s = parseInt(score.text());
    var new_level = current_level;

    // Điều kiện Level theo yêu cầu:
    // 5 điểm  -> Level 2
    // 20 điểm -> Level 3
    // 40 điểm -> Level 4
    // 50 điểm -> thắng game

    if (s >= 50) {
      // Dừng game và hiển thị chiến thắng
      stop_the_game(true);
      return;
    } else if (s >= 40) {
      new_level = 4;
    } else if (s >= 20) {
      new_level = 3;
    } else if (s >= 5) {
      new_level = 2;
    } else {
      new_level = 1;
    }

    // Nếu level thay đổi thì cập nhật giao diện + interval
    if (new_level !== current_level) {
      current_level = new_level;
      level.text("Level: " + current_level);

      // Map Level -> interval_time
      if (current_level === 1) interval_time = 40;
      else if (current_level === 2) interval_time = 30;
      else if (current_level === 3) interval_time = 25;
      else if (current_level === 4) interval_time = 20;

      // Restart game loop với interval mới nếu chưa game over
      if (!game_over) {
        playGame();
      }
    }
  }

  // Hàm thua hoặc thắng game
  function stop_the_game(is_win) {
    game_over = true;
    clearInterval(the_game);
    clearInterval(go_up);
    go_up = false;

    if (is_win) {
      $("#win_msg").slideDown(); // Thắng
      $("#restart_btn").slideDown(); // vẫn cho chơi lại
    } else {
      $("#restart_btn").slideDown(); // Thua
    }
  }

  // Khi click vào nút Chơi lại
  $("#restart_btn").click(function () {
    location.reload();
  });

  // Hàm va chạm giữa 2 object
  function collision($div1, $div2) {
    var x1 = $div1.offset().left;
    var y1 = $div1.offset().top;
    var h1 = $div1.outerHeight(true);
    var w1 = $div1.outerWidth(true);
    var b1 = y1 + h1;
    var r1 = x1 + w1;

    var x2 = $div2.offset().left;
    var y2 = $div2.offset().top;
    var h2 = $div2.outerHeight(true);
    var w2 = $div2.outerWidth(true);
    var b2 = y2 + h2;
    var r2 = x2 + w2;

    if (b1 < y2 || y1 > b2 || r1 < x2 || x1 > r2) {
      return false;
    } else {
      return true;
    }
  }
});
