// ページの読み込みが完了したらコールバック関数が呼ばれる
// ※コールバック: 第2引数の無名関数(=関数名が省略された関数)
window.addEventListener('load', () => {
    const canvas = document.querySelector('#draw-area');
    // contextを使ってcanvasに絵を書いていく
    const context = canvas.getContext('2d');
    var pen_mode = 0 // 0 pen, 1 fill
    const clearButton = document.querySelector('#clear-button');
    const fillButton = document.querySelector('#fill-button');
    const convertButton = document.querySelector('#convert-button');

    // 直前のマウスのcanvas上のx座標とy座標を記録する
    const lastPosition = { x: null, y: null };
  
    // マウスがドラッグされているか(クリックされたままか)判断するためのフラグ
    let isDrag = false;
  
    // 絵を書く
    function draw(x, y) {
      // マウスがドラッグされていなかったら処理を中断する。
      // ドラッグしながらしか絵を書くことが出来ない。
      if(!isDrag) {
        return;
      }
  
      // 「context.beginPath()」と「context.closePath()」を都度draw関数内で実行するよりも、
      // 線の描き始め(dragStart関数)と線の描き終わり(dragEnd)で1回ずつ読んだほうがより綺麗に線画書ける
  
      // 線の状態を定義する
      // MDN CanvasRenderingContext2D: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineJoin
      context.lineCap = 'round'; // 丸みを帯びた線にする
      context.lineJoin = 'round'; // 丸みを帯びた線にする
      context.lineWidth = 5; // 線の太さ
      context.strokeStyle = 'black'; // 線の色
  
      // 書き始めは lastPosition.x, lastPosition.y の値はnullとなっているため、
      // クリックしたところを開始点としている。
      // この関数(draw関数内)の最後の2行で lastPosition.xとlastPosition.yに
      // 現在のx, y座標を記録することで、次にマウスを動かした時に、
      // 前回の位置から現在のマウスの位置まで線を引くようになる。
      if (lastPosition.x === null || lastPosition.y === null) {
        // ドラッグ開始時の線の開始位置
        context.moveTo(x, y);
      } else {
        // ドラッグ中の線の開始位置
        context.moveTo(lastPosition.x, lastPosition.y);
      }
      // context.moveToで設定した位置から、context.lineToで設定した位置までの線を引く。
      // - 開始時はmoveToとlineToの値が同じであるためただの点となる。
      // - ドラッグ中はlastPosition変数で前回のマウス位置を記録しているため、
      //   前回の位置から現在の位置までの線(点のつながり)となる
      context.lineTo(x, y);
  
      // context.moveTo, context.lineToの値を元に実際に線を引く
      context.stroke();
  
      // 現在のマウス位置を記録して、次回線を書くときの開始点に使う
      lastPosition.x = x;
      lastPosition.y = y;
    }
  
    // canvas上に書いた絵を全部消す
    function clear() {
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
  
    // マウスのドラッグを開始したらisDragのフラグをtrueにしてdraw関数内で
    // お絵かき処理が途中で止まらないようにする
    function dragStart(event) {
      // これから新しい線を書き始めることを宣言する
      // 一連の線を書く処理が終了したらdragEnd関数内のclosePathで終了を宣言する
      if (pen_mode == 1){
        const inner_canvas = document.querySelector('#draw-area');
        var drawnImg = inner_canvas.toDataURL("image/png")
        $.ajax({
          'url': 'fill/',
          'type': 'POST',
          'data':{
            'imgBase64': drawnImg,
            'x':event.layerX, 
            'y':event.layerY
          }
        }).done(
          response => {;
          // console.log(response);
          const canvas = document.querySelector("#draw-area");
          const ctx = canvas.getContext("2d");
          const img = new Image();
          // console.log(response.fill_img)
          img.src = response.fill_img;
          img.onload = () => {
            ctx.drawImage(img, 0, 0);
          };
          pen_mode = 0
        }
        )
      }
      else{
        context.beginPath();
  
        isDrag = true;
      }
      
    }
    // マウスのドラッグが終了したら、もしくはマウスがcanvas外に移動したら
    // isDragのフラグをfalseにしてdraw関数内でお絵かき処理が中断されるようにする
    function dragEnd(event) {
      // 線を書く処理の終了を宣言する
      context.closePath();
      isDrag = false;
  
      // 描画中に記録していた値をリセットする
      lastPosition.x = null;
      lastPosition.y = null;
    }
    
    // fill
    function fill(event){
      pen_mode = 1
    }

    // pix2pix convert
    function convert(event){
      const inner_canvas = document.querySelector('#draw-area');
      var drawnImg = inner_canvas.toDataURL("image/png")
      $.ajax({
        'url': 'showGen/',
        'type': 'POST',
        'data':{
          'imgBase64': drawnImg
        }
      }).done(
        response => {
        const canvas = document.querySelector("#show-area");
        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.src = response.return_img;
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
        };

      }
      )
    };
    

    // マウス操作やボタンクリック時のイベント処理を定義する
    function initEventHandler() {
      
      clearButton.addEventListener('click', clear);
      
      fillButton.addEventListener('click', fill);

      convertButton.addEventListener('click', convert);

      canvas.addEventListener('mousedown', dragStart);
      canvas.addEventListener('mouseup', dragEnd);
      canvas.addEventListener('mouseout', dragEnd);
      canvas.addEventListener('mousemove', (event) => {
        // eventの中の値を見たい場合は以下のようにconsole.log(event)で、
        // デベロッパーツールのコンソールに出力させると良い
        // console.log(event);
      
      draw(event.layerX, event.layerY);
      });
    }
  
    // イベント処理を初期化する
    initEventHandler();
  });