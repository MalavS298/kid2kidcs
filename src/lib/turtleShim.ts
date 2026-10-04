// A tiny Python "turtle" module for Pyodide. It records drawing commands,
// which TurtleCanvas then replays as an animation.
export const TURTLE_SHIM = String.raw`
import sys, types, json, math
_src = r'''
import math
_events = []
_ids = [0]
_colormode = [1.0]
_NAMED = {}
def _c(c):
    if isinstance(c, (tuple, list)):
        r, g, b = c[:3]
        if _colormode[0] == 1.0:
            r, g, b = r*255, g*255, b*255
        return "rgb(%d,%d,%d)" % (int(r), int(g), int(b))
    return str(c)
def _emit(**e):
    _events.append(e)

class Turtle:
    def __init__(self, shape="classic", visible=True):
        _ids[0] += 1
        self._id = _ids[0]
        self._x = 0.0; self._y = 0.0; self._h = 0.0
        self._pen = True; self._pc = "black"; self._fc = "black"; self._w = 1
        self._shape = shape; self._vis = visible; self._speed = 3
        self._fill = None
        _emit(type="new", t=self._id, shape=shape, visible=visible, color=self._pc, fill=self._fc)
    def _state(self, **extra):
        _emit(type="state", t=self._id, x=self._x, y=self._y, h=self._h, **extra)
    def _moveto(self, x, y):
        _emit(type="move", t=self._id, x1=self._x, y1=self._y, x=x, y=y, h=self._h,
              pen=self._pen, color=self._pc, width=self._w, speed=self._speed)
        self._x, self._y = float(x), float(y)
        if self._fill is not None: self._fill.append((self._x, self._y))
    def forward(self, d):
        r = math.radians(self._h)
        self._moveto(self._x + d*math.cos(r), self._y + d*math.sin(r))
    fd = forward
    def backward(self, d): self.forward(-d)
    bk = back = backward
    def left(self, a):
        self._h = (self._h + a) % 360; self._state(speed=self._speed, turn=True)
    lt = left
    def right(self, a): self.left(-a)
    rt = right
    def setheading(self, a): self._h = a % 360; self._state(speed=self._speed, turn=True)
    seth = setheading
    def goto(self, x, y=None):
        if y is None: x, y = x
        self._moveto(x, y)
    setpos = setposition = goto
    def setx(self, x): self._moveto(x, self._y)
    def sety(self, y): self._moveto(self._x, y)
    def home(self): self._moveto(0, 0); self.setheading(0)
    def position(self): return (self._x, self._y)
    pos = position
    def xcor(self): return self._x
    def ycor(self): return self._y
    def heading(self): return self._h
    def distance(self, x, y=None):
        if y is None:
            if isinstance(x, Turtle): x, y = x._x, x._y
            else: x, y = x
        return math.hypot(self._x - x, self._y - y)
    def penup(self): self._pen = False
    pu = up = penup
    def pendown(self): self._pen = True
    pd = down = pendown
    def isdown(self): return self._pen
    def pensize(self, w=None):
        if w is None: return self._w
        self._w = w
    width = pensize
    def pencolor(self, *c):
        if not c: return self._pc
        self._pc = _c(c[0] if len(c) == 1 else c); _emit(type="look", t=self._id, color=self._pc, fill=self._fc)
    def fillcolor(self, *c):
        if not c: return self._fc
        self._fc = _c(c[0] if len(c) == 1 else c); _emit(type="look", t=self._id, color=self._pc, fill=self._fc)
    def color(self, *args):
        if not args: return (self._pc, self._fc)
        if len(args) == 1: self._pc = self._fc = _c(args[0])
        elif len(args) == 2: self._pc, self._fc = _c(args[0]), _c(args[1])
        else: self._pc = self._fc = _c(args)
        _emit(type="look", t=self._id, color=self._pc, fill=self._fc)
    def shape(self, s=None):
        if s is None: return self._shape
        self._shape = s; _emit(type="shape", t=self._id, shape=s)
    def shapesize(self, *a, **k): pass
    turtlesize = shapesize
    def speed(self, s=None):
        if s is None: return self._speed
        names = {"fastest": 0, "fast": 10, "normal": 6, "slow": 3, "slowest": 1}
        self._speed = names.get(s, s) if isinstance(s, str) else int(s)
    def hideturtle(self): self._vis = False; _emit(type="vis", t=self._id, visible=False)
    ht = hideturtle
    def showturtle(self): self._vis = True; _emit(type="vis", t=self._id, visible=True)
    st = showturtle
    def isvisible(self): return self._vis
    def write(self, arg, move=False, align="left", font=("Arial", 8, "normal")):
        _emit(type="write", t=self._id, x=self._x, y=self._y, text=str(arg), align=align,
              font=list(font), color=self._pc)
    def dot(self, size=None, *color):
        c = _c(color[0] if len(color) == 1 else color) if color else self._pc
        _emit(type="dot", x=self._x, y=self._y, size=size or max(self._w + 4, self._w * 2), color=c)
    def stamp(self):
        _emit(type="stamp", t=self._id, x=self._x, y=self._y, h=self._h, shape=self._shape, color=self._pc, fill=self._fc)
    def circle(self, radius, extent=360, steps=None):
        steps = steps or max(12, int(abs(extent) / 6))
        step_a = extent / steps
        step_l = 2 * radius * math.sin(math.radians(abs(step_a) / 2))
        sign = 1 if radius >= 0 else -1
        for _ in range(steps):
            self._h = (self._h + step_a / 2 * sign) % 360
            self.forward(step_l if radius >= 0 else step_l)
            self._h = (self._h + step_a / 2 * sign) % 360
        self._state(speed=self._speed, turn=True)
    def begin_fill(self): self._fill = [(self._x, self._y)]
    def end_fill(self):
        if self._fill and len(self._fill) > 2:
            _emit(type="fill", points=self._fill, color=self._fc)
        self._fill = None
    def clear(self): pass
    def reset(self): pass
    def getscreen(self): return _screen

Pen = RawTurtle = Turtle

class _Screen:
    def bgcolor(self, c=None):
        if c is not None: _emit(type="bg", color=_c(c))
    def setup(self, width=None, height=None, *a, **k): pass
    def screensize(self, *a, **k): pass
    def title(self, *a): pass
    def tracer(self, n=None, *a): _emit(type="tracer", on=bool(n) if n is not None else True)
    def update(self): pass
    def exitonclick(self): pass
    def mainloop(self): pass
    done = mainloop
    def colormode(self, m=None):
        if m is None: return _colormode[0]
        _colormode[0] = m
    def onclick(self, *a, **k): pass
    onkey = onkeypress = listen = onscreenclick = ontimer = onclick
    def clear(self): pass
    def window_width(self): return 600
    def window_height(self): return 400
_screen = _Screen()
def Screen(): return _screen
def colormode(m=None): return _screen.colormode(m)
def bgcolor(c=None): _screen.bgcolor(c)
def done(): pass
mainloop = exitonclick = done
def tracer(n=None, *a): _screen.tracer(n)
def update(): pass
def setup(*a, **k): pass
def title(*a): pass
def hideturtle(): getturtle().hideturtle()

_default = [None]
def getturtle():
    if _default[0] is None: _default[0] = Turtle()
    return _default[0]
getpen = getturtle
def _mk(n):
    def f(*a, **k): return getattr(getturtle(), n)(*a, **k)
    return f
for _n in ["forward","fd","backward","bk","back","left","lt","right","rt","setheading","seth","goto",
           "setpos","setposition","setx","sety","home","position","pos","xcor","ycor","heading","distance",
           "penup","pu","up","pendown","pd","down","isdown","pensize","width","pencolor","fillcolor","color",
           "shape","shapesize","turtlesize","speed","showturtle","st","ht","isvisible","write","dot",
           "stamp","circle","begin_fill","end_fill","clear","reset"]:
    globals()[_n] = _mk(_n)

def _export():
    import json
    return json.dumps(_events)
'''
def _install_turtle():
    m = types.ModuleType("turtle")
    exec(_src, m.__dict__)
    sys.modules["turtle"] = m
_install_turtle()
`;
