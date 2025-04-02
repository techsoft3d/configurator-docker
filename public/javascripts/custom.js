var matrixHash = [];
function animate(opts) {
    var start = new Date();
    var id = setInterval(function () {
        var timePassed = new Date() - start;
        var progress = timePassed / opts.duration;
        if (progress > 1) { progress = 1; }
        if (progress < 0) { progress = 0; }
        var deltav = opts.delta(progress);
        opts.step(deltav, progress, opts.nodeids, opts.nodedeltastart, opts.nodedeltaend);
        if (progress == 1) {
            clearInterval(id);
        }
    }, 10);
}

function linear(progress) {
    return progress;
}

function circ(progress) {
    return 1 - Math.sin(Math.acos(progress));
}

function makeEaseInOut(delta) {
    return function (progress) {
        if (progress < 0.5) {
            return delta(2 * progress) / 2;
        } else {
            return (2 - delta(2 * (1 - progress))) / 2;
        }
    };
}

function makeEaseOut(delta) {
    return function (progress) {
        return 1 - delta(1 - progress);
    };
}

function performAnimation(animIds, animdeltas, animdeltas2, execatend) {
    var model = hwv.getModel();
    var ids = new Array();
    for (var i = 0; i < animIds.length; i++) {
        if (matrixHash[animIds[i]] == undefined) {
            var m2 = model.getNodeMatrix(animIds[i]);
            matrixHash[animIds[i]] = m2.copy();
        }
    }

    animate({
        delay: 10,
        duration: 2000,
        delta: makeEaseInOut(circ),
        nodeids: animIds,
        nodedeltastart: animdeltas,
        nodedeltaend: animdeltas2,
        step: function (delta, progress, ids, deltastart, deltaend) {
            hwv.resumeRendering();
            var model = hwv.getModel();
            for (var i = 0; i < ids.length; i++) {
                var parent = model.getNodeParent(ids[i]);
                var mp = model.getNodeNetMatrix(parent);
                var mpi = Communicator.Matrix.inverse(mp);
                var xxx = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, deltastart[i].x + (deltaend[i].x - deltastart[i].x) * delta, deltastart[i].y + (deltaend[i].y - deltastart[i].y) * delta, deltastart[i].z + (deltaend[i].z - deltastart[i].z) * delta, 1];
                var m = Communicator.Matrix.createFromArray(xxx);
                var m2 = model.getNodeMatrix(ids[i]);
                m2 = matrixHash[ids[i]].copy();
                var mtemp = Communicator.Matrix.multiply(m, mpi);
                var mtemp2 = Communicator.Matrix.multiply(mtemp, mp);
                var mtemp3 = Communicator.Matrix.multiply(mtemp2, m2);
                model.setNodeMatrix(ids[i], mtemp3);
            }
        },
        execAtEnd: execatend
    });
}

cameras = [
    { // Cockpit
        "position": {
            "x": -1459.0901803905706,
            "y": 233.7405976236866,
            "z": 900.206592319545
        },
        "target": {
            "x": -701.3832746261907,
            "y": 78.24342386633479,
            "z": 797.7392851842828
        },
        "up": {
            "x": 0.12261953738192106,
            "y": -0.0554700006444585,
            "z": 0.9909023807019274
        },
        "width": 780.255519122479,
        "height": 780.255519122479,
        "projection": 1,
        "nearLimit": 0.01,
        "cameraFlags": 0
    },
    { // Whole truck
        "position": {
            "x": -5374.65404331693,
            "y": -2749.2290114268794,
            "z": 895.9746134927271
        },
        "target": {
            "x": -1967.1206041338387,
            "y": 1311.848356936189,
            "z": -467.43557763151625
        },
        "up": {
            "x": 0.08979469504358814,
            "y": 0.248454570857159,
            "z": 0.9644725185106179
        },
        "width": 5473.803145916249,
        "height": 5473.803145916249,
        "projection": 1,
        "nearLimit": 0.001,
        "cameraFlags": 0
    },
    {
        "position": {
            "x": -477.24996718462484,
            "y": -321.72543261099054,
            "z": 130.56968810263717
        },
        "target": {
            "x": -332.9292396937366,
            "y": 8.058566766467067,
            "z": 46.840606900437656
        },
        "up": {
            "x": -0.0051255161945717494,
            "y": 0.24818659849477492,
            "z": 0.9686986845306093
        },
        "width": 369.58965214456276,
        "height": 369.58965214456276,
        "projection": 0,
        "nearLimit": 0.001,
        "cameraFlags": 0
    },
    {
        "position": {
            "x": -572.84036451794734,
            "y": 5.89180320510124,
            "z": 388.8003922152847
        },
        "target": {
            "x": -1491.6687031365873,
            "y": 821.7537378731848,
            "z": -321.3555052002635
        },
        "up": {
            "x": -0.42104984827724345,
            "y": 0.277478628952918,
            "z": 0.8635523352641225
        },
        "width": 1419.2242642351215,
        "height": 1419.2242642351215,
        "projection": 0,
        "nearLimit": 0.01,
        "cameraFlags": 0
    }
];

var lastval = -1;
var craneVisible = false;
var trailerVisible = false;
var hoodVisible = false;
var notloaded1 = true;
var notloaded2 = true;
var steering2 = 0, steering3 = 0, engineid1 = 67, engineid2 = 6486;
var steeringBack = 2461;
var steeringFront = 3252;

var hoodID = 2439;
var trailerID = 3;
var craneID = 4;

var engine1ID = 67; //original engine
var engine2ID = 6486;
var stearing1ID = 2461;
var stearing2ID = 3483;
var STEERING_1 = [
    2461,
];

var STEERING_2 = [
    3252,
];

var steering_2_debris = [
    4294967301
]

var STEERING_WHEELS = [];

function setSteering(steering_array) {
    hwv.getModel().requestNodes(steering_array);
    hwv.getModel().setNodesVisibility(STEERING_WHEELS, false);
    hwv.getModel().setNodesVisibility(steering_array, true);
    hwv.getModel().setNodesVisibility(steering_2_debris, false);
}

function setView(val) {
    if (val >= 0) {
        if (val == 0) {
            var camera = Communicator.Camera.construct(cameras[val]);
            hwv.getView().setCamera(camera, 500);
        }

        if (val == 1) {
            var camera = Communicator.Camera.construct(cameras[val]);
            hwv.getView().setCamera(camera, 500);
        }

        if (val == 2) {
            hwv.getModel().requestNodes([3]);
            if (!trailerVisible) {
                trailerVisible = true;
                hwv.pauseRendering();
                var camera = Communicator.Camera.construct(cameras[2]);
                hwv.getModel().setNodesVisibility([trailerID], true);
                if (notloaded1 == true) {
                    notloaded1 = false;
                    hwv.resumeRendering();
                } else {
                    var nd = [];
                    nd.push(new Communicator.Point3(0, 0, -1000));
                    var nd2 = [];
                    nd2.push(new Communicator.Point3(0, 0, 0));
                    performAnimation([trailerID], nd, nd2);
                }
            } else {
                trailerVisible = false;
                var nd = [];
                nd.push(new Communicator.Point3(0, 0, 0));
                var nd2 = [];
                nd2.push(new Communicator.Point3(0, 0, -1000));
                performAnimation([trailerID], nd, nd2, function () { hwv.getModel().setNodesVisibility([trailerID], false); });
            }
        }
        if (val == 3) {
            if (!craneVisible) {
                hwv.getModel().requestNodes([4]);
                craneVisible = true;
                hwv.pauseRendering();
                var camera = Communicator.Camera.construct(cameras[2]);
                hwv.getModel().setNodesVisibility([craneID], true);
                if (notloaded2 == true) {
                    notloaded2 = false;
                    hwv.resumeRendering();
                } else {
                    var nd = [];
                    nd.push(new Communicator.Point3(0, 0, 500));
                    var nd2 = [];
                    nd2.push(new Communicator.Point3(0, 0, 0));
                    performAnimation([craneID], nd, nd2);
                }
            } else {
                craneVisible = false;
                var nd = [];
                nd.push(new Communicator.Point3(0, 0, 0));
                var nd2 = [];
                nd2.push(new Communicator.Point3(0, 0, 500));
                performAnimation([craneID], nd, nd2, function () { hwv.getModel().setNodesVisibility([craneID], false); })
            }
        }
        if (val == 4) {
            if (hoodVisible) {
                hoodVisible = false;
                hwv.pauseRendering();
                var camera = Communicator.Camera.construct(cameras[3]);
                hwv.getView().setCamera(camera, 500);
                var nd = [];
                nd.push(new Communicator.Point3(0, 75, 0));
                var nd2 = [];
                nd2.push(new Communicator.Point3(0, 0, 0));
                performAnimation([hoodID], nd, nd2)
            } else {
                var camera = Communicator.Camera.construct(cameras[3]);
                hwv.getView().setCamera(camera, 500);
                hoodVisible = true;
                var nd = [];
                nd.push(new Communicator.Point3(0, 0, 0));
                var nd2 = [];
                nd2.push(new Communicator.Point3(0, 75, 0));
                performAnimation([hoodID], nd, nd2, function () { });
            }
        }
        if (val == 5) {
            hwv.getModel().requestNodes([engineid2]);
            hwv.getModel().setNodesVisibility([engineid2], true);
            hwv.getModel().setNodesVisibility([engineid1], false);
        }
        if (val == 6) {
            hwv.getModel().setNodesVisibility([engineid2], false);
            hwv.getModel().setNodesVisibility([engineid1], true);
        }
        lastval = val;
    }
}
