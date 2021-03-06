import React from 'react';
import { List, EmailField,RichTextInput } from 'admin-on-rest/lib/mui';
import { CardActions } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import NavigationRefresh from 'material-ui/svg-icons/navigation/refresh';
import { NumberInput,
  required,
  NumberField,
  Create,
  Edit,
  SimpleForm,
  DisabledInput,
  TextInput,
  ListButton,
  Show,
  SimpleShowLayout,
  ShowButton,
  DateInput,
  LongTextInput,
  ReferenceManyField,
  Datagrid,
  TextField,
  DateField,
  EditButton,
  BooleanInput,
  TabbedForm,
  FormTab,
  Filter,
  SelectInput,
  SelectField,
  ImageField,
  ReferenceInput,
  ReferenceField } from 'admin-on-rest/lib/mui';

import { Field,FieldArray } from 'redux-form';
import TimePicker from 'material-ui/TimePicker';
import moment from 'moment';
import {CreateActions,EditActions} from '../controls/createeditactions';

const deviceDefaultValue = {created_at:new Date(),updated_at:new Date()};

const DeviceCreate = (props) => (
  <Create title="创建节点"  {...props} actions={<CreateActions />}>
    <SimpleForm defaultValue={deviceDefaultValue}>
      <TextInput label="节点ID" source="DeviceId" validate={required} />
      <TextInput label="节点名字" source="name" validate={required} />
      <ReferenceInput label="网关ID" source="gatewayid" reference="gateway" allowEmpty>
        <SelectInput optionText="name" />
      </ReferenceInput>
    </SimpleForm>
  </Create>
);


const DeviceEdit = (props) => {
  return (<Edit title="节点信息" {...props}  actions={<EditActions />}>
      <TabbedForm>
        <FormTab label="节点基本信息">
          <TextField label="节点ID" source="DeviceId"  />
          <TextInput label="节点名字" source="name"  validate={required} />
          <TextInput label="所属城市" source="city"  validate={required} />
          <TextInput label="所属城市首字母" source="cityindex"  validate={required} />
          <TextInput label="所在区域" source="locationname"  />
          <ReferenceInput label="网关ID" source="gatewayid" reference="gateway" allowEmpty>
            <SelectInput optionText="name" />
          </ReferenceInput>
          <NumberInput label="经度" source="Longitude"  />
          <NumberInput label="纬度" source="Latitude"  />
        </FormTab>
        <FormTab label="实时数据">
          <TextField label="温度" source="realtimedata.temperature"  />
          <TextField label="降雨量" source="realtimedata.rainfall"  />
          <TextField label="湿度" source="realtimedata.humidity" />
          <TextField label="风力" source="realtimedata.windspeed" />
          <TextField label="风向" source="realtimedata.winddirection" />
          <TextField label="大气压" source="realtimedata.pressure" />
          <TextField label="最后更新时间" source="realtimedata.updatetime" />
        </FormTab>
      </TabbedForm>
    </Edit>
    );
};

const DeviceShowActions = ({basePath,data,refresh}) => (
  <CardActions>
    <ListButton basePath={basePath} />
    <EditButton basePath={basePath} record={data} />
    <FlatButton primary label="Refresh" onClick={refresh} icon={<NavigationRefresh />} />
  </CardActions>
);

const DeviceFilter = (props) => (
  <Filter {...props}>
    <TextInput label="搜索节点" source="DeviceId_q" />
  </Filter>
)

const DeviceList = (props) => (
  <List title="节点管理" filters={<DeviceFilter />} sort={{field:'LastRealtimeAlarm.DataTime',order:'DESC'}} {...props}>
    <Datagrid  bodyOptions={{ showRowHover: true }}>
      <TextField label="节点ID" source="DeviceId" />
      <TextField label="节点名字" source="name"/>
      <ReferenceField label="网关" source="gatewayid" reference="gateway" allowEmpty>
        <TextField source="name" />
      </ReferenceField>
      <TextField label="所在区域" source="locationname"/>
      <EditButton />
    </Datagrid>
  </List>
);

export {DeviceCreate,DeviceList,DeviceEdit}
