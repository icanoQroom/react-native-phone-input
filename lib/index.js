import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
  AppRegistry,
  StyleSheet,
  Image,
  TextInput,
  Text,
  TouchableWithoutFeedback,
  View
} from 'react-native';

import Flags from './resources/flags'
import PhoneNumber from './phoneNumber'
import styles from './styles';
import CountryPicker from './countryPicker'

export default class PhoneInput extends Component {

    constructor(props, context){
        super(props, context)

        this.onChangePhoneNumber = this.onChangePhoneNumber.bind(this)
        this.onPressFlag = this.onPressFlag.bind(this)
        this.selectCountry = this.selectCountry.bind(this)
        this.getFlag = this.getFlag.bind(this)

        var iso2 = this.props.initialCountry || 'us'
        var countryData = PhoneNumber.getCountryDataByCode(iso2)
        this.state = {
            iso2,
            dialCode: countryData?`+${countryData.dialCode}`:'',
            formattedNumber: '',
            value: null
        }
    }

    componentWillReceiveProps(nextProps){
        if(nextProps.value != this.state.value){
            this.setState({value: nextProps.value})
            this.updateFlagAndFormatNumber(nextProps.value)
        }
    }

    componentWillMount(){
        if(this.props.value)
            this.updateFlagAndFormatNumber(this.props.value)
    }

    possiblyEliminateZeroAfterCountryCode(number) {
        const dialCode = PhoneNumber.getDialCode(number);
        return number.startsWith(dialCode + '0')
          ? dialCode + number.substr(dialCode.length + 1)
          : number;
    }

    updateFlagAndFormatNumber(number, actionAfterSetState = null){
        if(this.props.forceCountryToMexico != null && this.props.forceCountryToMexico == true) {
            var iso2 = 'mx';
            var phoneNumber = number

            if(number){
                if(!phoneNumber.startsWith('+52'))
                    phoneNumber = '+52'
                phoneNumber = this.possiblyEliminateZeroAfterCountryCode(phoneNumber);
                iso2 = 'mx'
            }

            this.setState({iso2, formattedNumber: phoneNumber}, actionAfterSetState)
        } else {
            var iso2 = this.props.initialCountry || 'us'
            var phoneNumber = number
            if(number){
                if(phoneNumber[0] != '+')
                    phoneNumber = `+${phoneNumber}`
                phoneNumber = this.possiblyEliminateZeroAfterCountryCode(phoneNumber);
                iso2 = PhoneNumber.getCountryCodeOfNumber(phoneNumber)
            }

            this.setState({iso2, formattedNumber: phoneNumber}, actionAfterSetState)
        }
    }

    onChangePhoneNumber(number){
        var actionAfterSetState = this.props.onChangePhoneNumber?() => {this.props.onChangePhoneNumber(number)}:null
        this.updateFlagAndFormatNumber(number, actionAfterSetState)
    }

    isValidNumber(){
        return PhoneNumber.isValidNumber(this.state.formattedNumber, this.state.iso2)
    }

    getNumberType(){
        return PhoneNumber.getNumberType(this.state.formattedNumber, this.state.iso2)
    }

    getValue(){
        return this.state.formattedNumber
    }

    getDialCode() {
        return PhoneNumber.getDialCode(this.state.formattedNumber);
    }

    getFlag(iso2){
        return Flags.get(iso2)
    }

    getAllCountries(){
        return PhoneNumber.getAllCountries()
    }

    getPickerData(){
        return PhoneNumber.getAllCountries().map((country,index) => {
            return {
                key: index,
                image: Flags.get(country.iso2),
                label: country.name,
                dialCode: `+${country.dialCode}`,
                iso2: country.iso2
            }
        })
    }

    selectCountry(iso2){
        if(this.state.iso2 != iso2){
            var countryData = PhoneNumber.getCountryDataByCode(iso2)
            if(countryData){
                this.setState({
                    iso2,
                    formattedNumber: `+${countryData.dialCode}`
                }, ()=>{
                    if(this.props.onSelectCountry)
                        this.props.onSelectCountry(iso2)
                })
            }
        }
    }

    onPressFlag(){
        if(this.props.onPressFlag)
            this.props.onPressFlag()
        else{
            if(this.state.iso2)
                this.refs.picker.selectCountry(this.state.iso2)
            this.refs.picker.show()
        }
    }

    focusInput() {
        this.refs.phoneInput.focus();
    }

    render(){
        const TextComponent = this.props.textComponent || TextInput;
        const forceCountry = this.props.forceCountry;

        return (
            <View style={[styles.container, this.props.style]}>
                <TouchableWithoutFeedback onPress={this.onPressFlag}>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Image source={Flags.get(this.state.iso2)}
                            resizeMode='stretch'
                            style={[styles.flag, this.props.flagStyle]}
                            onPress={this.onPressFlag}
                        />
                        { this.props != null && (this.props.forceCountryToMexico == undefined || this.props.forceCountryToMexico == false) && 
                            <Image
                                source={require('./resources/arrow_bottom.png')}
                                style={{width: 24, height: 21, marginLeft: 1}}
                            />
                        }
                    </View>
                </TouchableWithoutFeedback>
                <View style={{flex:1, flexDirection: 'row', marginLeft:this.props.offset || 10, paddingBottom: 5, borderBottomWidth: 2, borderBottomColor: '#888888'}}>
                    <TextComponent
                        autoCorrect={false}
                        style={[styles.text, this.props.textStyle, {width: "100%"}]}
                        onChangeText={(text) => this.onChangePhoneNumber(text)}
                        keyboardType='phone-pad'
                        underlineColorAndroid='rgba(0,0,0,0)'
                        value={this.state.formattedNumber}
                        ref='phoneInput'
                    />
                </View>

                <CountryPicker
                    ref={'picker'}
                    selectedCountry={this.state.iso2}
                    onSubmit={this.selectCountry}
                    buttonColor={this.props.pickerButtonColor}
                    buttonTextStyle={this.props.pickerButtonTextStyle}
                    itemStyle={this.props.itemStyle}
                    cancelText={this.props.cancelText}
                    cancelTextStyle={this.props.cancelTextStyle}
                    confirmText={this.props.confirmText}
                    confirmTextStyle={this.props.confirmTextStyle}
                    pickerBackgroundColor={this.props.pickerBackgroundColor}
                    itemStyle={this.props.pickerItemStyle}
                />
            </View>
        )
    }
}

PhoneInput.propTypes = {
  textComponent: PropTypes.func,
  initialCountry: PropTypes.string,
  onChangePhoneNumber: PropTypes.func,
  value: PropTypes.string,
  style: PropTypes.object,
  flagStyle: PropTypes.object,
  textStyle: PropTypes.object,
  offset: PropTypes.number,
  textProps: PropTypes.object,
  onSelectCountry: PropTypes.func,
  pickerButtonColor: PropTypes.string,
  pickerBackgroundColor: PropTypes.string,
  pickerItemStyle: PropTypes.object,
  cancelText: PropTypes.string,
  cancelTextStyle: PropTypes.object,
  confirmText: PropTypes.string,
  confirmTextTextStyle: PropTypes.object,
}
