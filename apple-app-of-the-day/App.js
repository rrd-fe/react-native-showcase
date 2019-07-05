import * as React from 'react';
import {
  Text,
  View,
  Image,
  Alert,
  Animated,
  StyleSheet,
  ScrollView,
  Dimensions,
  SafeAreaView,
  TouchableWithoutFeedback,
} from 'react-native';

const Images = [
  require('./assets/images/1.jpg'),
  require('./assets/images/2.jpg'),
  require('./assets/images/3.jpg'),
  require('./assets/images/4.jpg'),
];

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

export default class App extends React.Component {

  constructor(props) {
    super(props);
    this.imageRef = [];
    this.oldPosition = {};
    // 描述图片的位置变化
    this.position = new Animated.ValueXY();
    // 描述图片的大小变化
    this.measure = new Animated.ValueXY();
    // 其他动画公用变量
    this.animation = new Animated.Value(0);
    this.state = {
      activeImage: null,
    }
  }

  openImage = (index) => {
    this.imageRef[index].measure((x, y, width, height, pageX, pageY) => {
      // 记录图片点击的时候位置，关闭详情视图的时候需要还原回去
      this.oldPosition = {
        width,
        height,
        x: pageX,
        y: pageY,
      };

      // 初始化动画变量，准备开始动画
      this.position.setValue({
        x: pageX,
        y: pageY,
      });
      this.measure.setValue({
        x: width,
        y: height,
      });

      this.setState(() => {
        return {
          activeImage: Images[index],
        }
      }, () => {
        this.imageContainer.measure((x, y, width, height, pageX, pageY) => {
          Animated.parallel([
            Animated.timing(this.position.x, {
              toValue: pageX,
              duration: 300,
            }),
            Animated.timing(this.position.y, {
              toValue: pageY,
              duration: 300,
            }),
            Animated.timing(this.measure.x, {
              toValue: width,
              duration: 300,
            }),
            Animated.timing(this.measure.y, {
              toValue: height,
              duration: 300,
            }),
            Animated.timing(this.animation, {
              toValue: 1,
              duration: 300,
            }),
          ]).start();
        });
      });

    });
  }

  closeImage = () => {
    Animated.parallel([
      Animated.timing(this.position.x, {
        toValue: this.oldPosition.x,
        duration: 300,
      }),
      Animated.timing(this.position.y, {
        toValue: this.oldPosition.y,
        duration: 250,
      }),
      Animated.timing(this.measure.x, {
        toValue: this.oldPosition.width,
        duration: 250,
      }),
      Animated.timing(this.measure.y, {
        toValue: this.oldPosition.height,
        duration: 250,
      }),
      Animated.timing(this.animation, {
        toValue: 0,
        duration: 250,
      }),
    ]).start(() => {
      this.setState(() => {
        return {
          activeImage: null
        }
      });
    });
  }

  render() {

    const imageBorderAnimate = this.animation.interpolate({
      inputRange: [0, 0, 1],
      outputRange: [20, 10, 0]
    });
    // 设置图片的动画
    const imageAnimatedStyle = {
      top: this.position.y,
      left: this.position.x,
      width: this.measure.x,
      height: this.measure.y,
      borderRadius: imageBorderAnimate,
    };

    const contentOpacityAnimate = this.animation.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [0, 1, 1]
    });

    const contentYAnimate = this.animation.interpolate({
      inputRange: [0, 1],
      outputRange: [-150, 0]
    });
    // 设置内容的动画
    const contentAnimatedStyle = {
      opacity: contentOpacityAnimate,
      transform: [{
        translateY: contentYAnimate,
      }]
    }
    // 设置关闭按钮的动画
    const croseAnimatedStyle = {
      opacity: this.animation
    };

    return (
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView style={{ flex: 1, paddingTop: 20, }}>
          {
            Images.map((image, index) => {
              return (
                <TouchableWithoutFeedback onPress={() => { this.openImage(index); }}>
                  <View
                    style={{ height: SCREEN_HEIGHT - 150, width: SCREEN_WIDTH, padding: 15, }}
                  >
                    <Image
                      ref={(image) => { this.imageRef[index] = image; }}
                      source={image}
                      style={{ flex: 1, height: null, width: null, resizeMode: 'cover', borderRadius: 20, }}
                    />
                  </View>
                </TouchableWithoutFeedback>
              );
            })
          }
        </ScrollView>
        <View
          style={StyleSheet.absoluteFill}
          pointerEvents={this.state.activeImage ? 'auto': 'none'}
        >
          <View style={{ flex:2, zIndex: 1001, }} ref={(view) => { this.imageContainer = view; }}>
            <Animated.Image
              source={this.state.activeImage ? this.state.activeImage : null }
              style={[
                { top: 0, right: 0, height: null, width: null, resizeMode: 'cover' }, imageAnimatedStyle
              ]}
            />
            <TouchableWithoutFeedback
                hitSlop={{ top: 5, left: 5, bottom: 5, right: 5 }}
                onPress={this.closeImage}
            >
              <Animated.View style={[
                { position: 'absolute', right: 20, top: 30, },
                croseAnimatedStyle
              ]}>
                <Text style={{ fontSize: 20, color: '#fff' }}>X</Text>
              </Animated.View>
            </TouchableWithoutFeedback>
          </View>
          <Animated.View style={[
            { flex:1, zIndex: 1000, backgroundColor: '#fff' },
            contentAnimatedStyle
          ]}>
            <Text style={{ fontSize: 24 }}>这是图片的Title</Text>
            <Text>这是图片的内容区域</Text>
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }
}

