'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

module.exports = function (Base) {
    return function (_Base) {
        _inherits(Configurable, _Base);

        function Configurable() {
            _classCallCheck(this, Configurable);

            return _possibleConstructorReturn(this, (Configurable.__proto__ || Object.getPrototypeOf(Configurable)).apply(this, arguments));
        }

        _createClass(Configurable, null, [{
            key: 'setEnvironment',
            value: function setEnvironment(environment) {
                if (!environment) return;

                this.constructor._environment = environment + ':';
            }
        }, {
            key: 'setUseHostNames',
            value: function setUseHostNames(useHostNames) {
                this.constructor._useHostNames = useHostNames;
            }
        }, {
            key: 'environment',
            get: function get() {
                return this.constructor._environment || '';
            }
        }, {
            key: 'useHostNames',
            get: function get() {
                return this.constructor._useHostNames || false;
            }
        }]);

        return Configurable;
    }(Base);
};
//# sourceMappingURL=configurable.js.map