GraphContentLoads = function() {

//global data
D3DATA = {
	isBrushing : false
};
var main = $("#main");
var width = main.width();
var height = $(window).height();
console.log(width,height);
D3DATA.width = D3DATA.height = width > height ? height : width;

D3FUNC = {};

D3FUNC.transform = function(d) {
 	return "translate(" + D3FUNC.scaleX(d.PCAx) + "," + D3FUNC.scaleY(d.PCAy) + ")";
};

D3FUNC.zoom = function() {
	if (D3DATA.shiftKey) {
		return;
	}
    D3DATA.xAxisNode.call(D3FUNC.xAxis);
    D3DATA.yAxisNode.call(D3FUNC.yAxis);
	//D3DATA.points.selectAll('text').attr('opacity', d3.event.scale > 5 ? 1 : 0);
	D3DATA.points.selectAll('text').style('visibility', d3.event.scale > 5 ? 'visible' : 'hidden');
	return D3DATA.points.attr("transform", D3FUNC.transform);
};

D3FUNC.color = d3.scale.category10();
D3DATA.colorMap = {
	'setosa':0,
	'versicolor':1,
	'virginica':2
}
D3FUNC.colorFunc = function(d) {return D3FUNC.color(D3DATA.colorMap[d.Species]);};

D3FUNC.onBrush = function() {
	D3DATA.brush = D3DATA.svg.append('g')
		.datum(function() { return {
				selected : false,
				previouslySelected: false
			};
		})
		.attr('class', 'brush');
	D3DATA.brush.call(
			d3.svg.brush()
			.x(D3FUNC.scaleX)
			.y(D3FUNC.scaleY)
			.on("brushstart", function(d) {
				d3.event.target.clear();
				// click時の他の定義イベントを呼び出す
				d3.select(this).call(d3.event.target);
			})
			.on("brush", function() {
				var extent = d3.event.target.extent();
				D3DATA.dataNodes.each(function(d) {
					var x = d.PCAx;
					var y = d.PCAy;
					if (extent[0][0] <= x && x < extent[1][0] &&
						extent[0][1] <=y && y < extent[1][1]) {
						d3.select(this).attr('class', 'dataNode selected');
					}
				});
			})
			.on("brushend", function() {
				d3.event.target.clear();
				d3.select(this).call(d3.event.target);
			})
		);
};

D3FUNC.offBrush = function() {
	d3.selectAll('.brush').remove();
};

d3.tsv("data/iris.tsv", function(error, data) {
	// xから最小のキリの良い値を返す
	var rangeFloor = function(x) {
		var digit = 0;
		var n;
		if (-1 < x && x < 1) {
			var a = x > 0 ? 1 : -1;
			if (a<0) {
				x = -1 * x;
			}
			while(x < 10) {
				x = x*10;
				digit++;
				if (x < 10) {
					n = x << 0;
				}
			}
			console.log(n, digit);
			n = a > 0 ? n : n + 1 ;
			return a * n / Math.pow(10, digit-1);
		} else {
			n = x << 0;
			while(x != 0) {
				x = (x/10) << 0;
				digit++;
				if (x != 0) {
					n = x;
				}
			}
			n = n > 0 ? n : n - 1;
			return n * Math.pow(10, digit-1);
		}
	};

	// xから最大のキリの良い値を返す
	var rangeCeil = function(x) {
		var digit = 0;
		var n;
		if (-1 < x && x < 1) {
			var a = x > 0 ? 1 : -1;
			if (a<0) {
				x = -1 * x;
			}
			while(x < 10) {
				x = x*10;
				digit++;
				if (x < 10) {
					n = x << 0;
				}
			}
			console.log(n, digit);
			n = a > 0 ? n + 1 : n + 1 ;
			return a * n / Math.pow(10, digit-1);
		} else {
			n = x << 0;
			while(x != 0) {
				x = (x/10) << 0;
				digit++;
				if (x != 0) {
					n = x;
				}
			}
			n = n > 0 ? n + 1 : n;
			return n * Math.pow(10, digit-1);
		}
	};
	
	// x軸の最大値、最小値の取得
	var domainX = d3.extent(data, function(d){ return parseFloat(d.PCAx); });	// xの変換関数作成
	D3FUNC.scaleX = d3.scale.linear()
	.domain([rangeFloor(domainX[0]), rangeCeil(domainX[1])])
	.range([0, D3DATA.width]);

	// y軸の最大値、最小値の取得
	var domainY = d3.extent(data, function(d){ return parseFloat(d.PCAy); });	// yの変換関数作成
	D3FUNC.scaleY = d3.scale.linear()
	.domain([rangeFloor(domainY[0]), rangeCeil(domainY[1])])
	.range([0, D3DATA.height]);

	D3DATA.svg = d3.select("#main").append("svg")
	.attr("width", D3DATA.width)
	.attr("height", D3DATA.height)
	.append("g");

	D3DATA.container = D3DATA.svg.append('svg');
	
	//どこでも触れるようにoverlayを設置
	D3DATA.container.append("rect")
	.attr({
		class : "overlay",
		width : D3DATA.width,
		height : D3DATA.height
	});
	D3DATA.container.call(d3.behavior.zoom()
		.x(D3FUNC.scaleX)
		.y(D3FUNC.scaleY)
		.scaleExtent([1, 8])
		.on("zoom", D3FUNC.zoom)
		.size([D3DATA.width, D3DATA.height])
	);

    //正方形になるようにticksの比率をあわせる
    D3FUNC.xAxis = d3.svg.axis()
        .scale(D3FUNC.scaleX).orient('bottom').tickSize(D3DATA.height-20).ticks(D3DATA.width/100);
    D3FUNC.yAxis = d3.svg.axis()
        .scale(D3FUNC.scaleY).orient('left').tickSize(D3DATA.width-20).ticks(D3DATA.height/100);

    D3DATA.xAxisNode = D3DATA.container.append('g').attr('class', 'x axis')/*.attr('transform', 'translate(0,0)')*/;
    D3DATA.yAxisNode = D3DATA.container.append('g').attr('class', 'y axis').attr('transform', 'translate('+D3DATA.width+',0)');

    D3DATA.xAxisNode.call(D3FUNC.xAxis);
    D3DATA.yAxisNode.call(D3FUNC.yAxis)/*.append('text').attr('y', -10).attr('x', 10).text("y")*/;

	//データ点のグループ作成
	D3DATA.points = D3DATA.container.selectAll('g')
	.data(data)
	.enter()
	.append('g')
	.attr("transform", D3FUNC.transform); //データ移動配置
	
	//データ点
	D3DATA.dataNodes = D3DATA.points.append('circle')
	.attr({
		'class' : 'dataNode',
		'r' : 3,
		'fill' : D3FUNC.colorFunc
	});

	//ラベル
	D3DATA.points.append('text')
	.text(function(d) { return d.Species; })
	.attr({
		"font-family" : "sans-serif",
		"font-size" : "20px"
	})
	.style('visibility', 'hidden');

	//選択範囲
	D3DATA.points.append('circle')
	.attr({
		'class': 'selectable',
		'r' : 10,
		'opacity': 0
	})
	.on('mouseover', function() {
		d3.select(this.parentNode).selectAll('circle.dataNode').attr("fill", "red");
	})
	.on("mouseout", function() {
		d3.select(this.parentNode).selectAll('circle.dataNode').attr("fill", D3FUNC.colorFunc);
	})
	.on("click", function(d) {
        if (!D3DATA.isBrushing) {
            //brushing中でないなら新規選択扱いで既存のセレクトを削除
            d3.selectAll('circle.selected').attr('class', 'dataNode');
        }
        d3.select(this.parentNode).selectAll('circle.dataNode').attr('class', 'dataNode selected');
		$("#selectTarget").text(JSON.stringify(d));
		console.log(d);
	});

});

//shift key observe
d3.select(window)
.on('keydown', function(e) {
	if (!D3DATA.isBrushing) {
		switch (d3.event.keyCode) {
		case 16: //shiftKey
			D3DATA.isBrushing = true;
			D3FUNC.onBrush();
		}
	}
})
.on('keyup', function(e) {
	if (D3DATA.isBrushing) {
		switch (d3.event.keyCode) {
		case 16:
			D3DATA.isBrushing = false;
			D3FUNC.offBrush();
		}
	}
});

};

$(document).ready(function () {
    $('[data-toggle="tooltip"]').tooltip();

    $('[data-toggle="offcanvas"]').click(function () {
        $('.row-offcanvas').toggleClass('active')
    });
});