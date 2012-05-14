var s = io.connect('http://localhost:3000', {
	'reconnect': true,
	'reconnection delay': 500,
	'reconnection limit': 500,
	'max reconnection attempts': Infinity
});
var connect = false;
var Choice = function() {
	var self = this;
	this.ary = [];
	this.refresh = function(max) {
		self.ary = [];
		self.max = max;
		for(var i=1; i<=self.max; i++) self.ary[i] = 0; 
	};
	this.max = 0;
	this.most = function() {
		var tmp = 0;
		for(var i in self.ary) {
			if(tmp < self.ary[parseInt(i)]) {
				tmp = parseInt(i);
			}
		}
		return tmp-1;
	};
};

var choice = new Choice();

var DisplayLiner = function() {
	var self = this;
	this.counter = 0;
	this.returnCounter = function() {
		if($('.tweet:last').length !== 0) {
			self.counter = $('.tweet:last').position().top + $('.tweet:last').height() - 40;
			if((self.counter + 40) > $('#message').offset().top) self.counter = 0;
		} else {
			self.counter = 0;
		}
		return self.counter;
	}
};

var displayLiner = new DisplayLiner();

s.on('message', function(d){
	connect = true;
	var m = JSON.parse(d);
	if(m.type === 'tw') {
		$('body').append($('<div />', {
			class: 'tweet',
			css: {
				top: displayLiner.returnCounter(),
				left: $(window).width(),
			}
		}).append($('<img />', {
			class: 'userImage',
			src: m.user.image
		})).append($('<p />', {
			class: 'userName',
			html: m.user.name
		})).append($('<p />', {
			class: 'tweetBody',
			html: m.body
		})).animate({
			left: -($(window).width()*2)
		}, 12000, 'linear', function(){
			$(this).remove();
		}));
	} else if(m.type === 'DM') {
		var re = new RegExp('[1-'+choice.max+']');
		if(m.body.match(re)) {
			var num = parseInt(m.body);
			choice.ary[num] += 1;
			$('.choice:eq('+(num-1)+') > .count').html(choice.ary[num]);
		}
	}
});

var Scene = function(back, shika, daibutsu, jigsaw, name, message, center) {
	this.back = back;
	this.shika = shika;
	this.daibutsu = daibutsu;
	this.jigsaw = jigsaw;
	this.name = name;
	this.message = message;
	this.center = center;
};

var Scenes = function() {
	var self = this;
	this.scenes = [];
	this.currentScene = 0;
	this.addScene = function(back, shika, daibutsu, jigsaw, name, message, center) {
		self.scenes.push(new Scene(back, shika, daibutsu, jigsaw, name, message, center));
	};
	this.nextScene = function() {
		var sss = self.scenes[self.currentScene];
		var message = sss.message;
		if(sss.back) $('#back').attr('src', '/images/narajo.png');
		else $('#back').attr('src', '/images/univ.png');
		if(sss.center === 'nara()') {
			addChoice(['東大寺', '鹿', 'せんとくん', '奈良高専']);
		} else if(sss.center === 'havefun()') {
			addChoice(['たのしかった', 'まあまあ'])
		} else if(sss.center === 'understand()') {
			addChoice(['わかった！', 'うーんわからない〜']);
		} else if(sss.center === 'branch()') {
			message = message.split(',')[choice.most()];
		} else if(sss.center === 'kove()') {
			addChoice(['なんだろう・・・？', 'しってる！']);
		} else if(sss.center === 'diff()') {
			addChoice(['高専生が集う', '交流できる', 'プレゼンの経験', 'その他']);
		} else if(sss.center === 'make()') {
			addChoice(['しってる！', 'しらない！']);
		} else if(sss.center === 'end()') {
			$('#modalBack').empty().hide();
		} else if(sss.center.match('result')) {
			message = message.replace('/v', choice.ary[parseInt(sss.center.replace('result(', '').replace(')'))]);
		} else if(sss.center.match('/images/')) {
			if($('.centerImage').length !== 0) $('.centerImage').remove();
			$('body').append($('<div />', {
				class: 'centerImage'
			}).append($('<img />', {
				src: sss.center
			})));
		} else {
			$('.centerImage').remove();
		}
		$('#message').html(message);
		$('#name').html(sss.name);
		showCharactors(sss.shika, sss.daibutsu, sss.jigsaw);
		self.currentScene += 1;
	};
	this.init = function() {
		$.getJSON('/i', function(d) {
			for(var i in d.data) {
				self.addScene(d.data[i].back, d.data[i].shika, d.data[i].daibutsu, d.data[i].jigsaw, d.data[i].name, d.data[i].message, d.data[i].center);
			}
			self.nextScene();
		});
	};
};

$(document).ready(function() {
	$('body').css({
		width: $(window).width(),
		height: $(window).height()
	});
	$('#name').css({
		bottom: 40,
		left: $('#message').position().left
	});
	$('#modalBack').css({
		width: $(window).width(),
		height: $(window).height(),
		display: 'none'
	});
	$('#back').css({
		width: $(window).width(),
		height: $(window).height(),
		backgroundImage: 'url(/images/univ.png)'
	});
	var ss = new Scenes();
	ss.init();
	$('body').on('keydown', function(e){
		if(e.keyCode === 39) {
			ss.nextScene();
		}
	});
});

function addChoice(parm) {
	for(var i in parm) {
		$('#modalBack').append($('<div />', {
			class: 'choice',
			html: '<div class=\'subject\'>'+(parseInt(i)+1)+' '+parm[i]+'</div><div class=\'count\'>0</div>'
		}));
	}
	$('#modalBack').show();
	choice.refresh(parm.length);
}

function showCharactors(shika, daibutsu, jigsaw) {
	if(shika) $('#shika').show();
	else $('#shika').hide();
	if(daibutsu) $('#daibutsu').show();
	else $('#daibutsu').hide();
	if(jigsaw) $('#jigsaw').show();
	else $('#jigsaw').hide();
}
