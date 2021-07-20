import React, { useState } from 'react';
import {
  observer,
  connect,
  useField,
  RecursionField,
  ISchema,
  Schema,
  useFieldSchema,
  useForm,
  FormConsumer,
} from '@formily/react';
import { ArrayCollapse, FormLayout } from '@formily/antd';
import { uid } from '@formily/shared';
import '@formily/antd/lib/form-tab/style';
import {
  Collapse,
  Button,
  Dropdown,
  Menu,
  Tag,
  Select,
  Divider,
  Input,
  Badge,
  message,
  Spin,
} from 'antd';
import { options, interfaces } from './interfaces';
import {
  DeleteOutlined,
  DatabaseOutlined,
  PlusOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import cls from 'classnames';
import './style.less';
import Modal from 'antd/lib/modal/Modal';
import { clone, cloneDeep, get } from 'lodash';
import { useEffect } from 'react';
import { useRequest } from 'ahooks';
import { createOrUpdateCollection, deleteCollection, useCollectionContext } from '..';

export const DatabaseCollection = observer((props) => {
  const field = useField<Formily.Core.Models.ArrayField>();
  const [visible, setVisible] = useState(false);
  const [open, setOpen] = useState(false);
  const schema = useFieldSchema();
  const [activeIndex, setActiveIndex] = useState(0);
  const form = useForm();
  const [newValue, setNewValue] = useState('');
  const { refresh } = useCollectionContext();

  const { run, loading } = useRequest('collections:findAll', {
    formatResult: (result) => result?.data,
    onSuccess(data) {
      field.setValue(data);
      console.log('onSuccess', data);
    },
    manual: true,
  });

  return (
    <div>
      <Button
        className={'nb-database-config'}
        style={{
          height: 46,
          borderRadius: 0,
        }}
        onClick={async () => {
          setVisible(true);
          await run();
          if (field.value?.length === 0) {
            field.push({
              name: `t_${uid()}`,
              unsaved: true,
              fields: [],
            });
          }
        }}
        type={'primary'}
      >
        <DatabaseOutlined />
      </Button>
      <Modal
        title={
          <div style={{ textAlign: 'center' }}>
            <Select
              loading={loading}
              value={activeIndex}
              style={{ minWidth: 300, textAlign: 'center' }}
              onChange={(value) => {
                setActiveIndex(value as any);
              }}
              open={open}
              onDropdownVisibleChange={setOpen}
              optionLabelProp={'label'}
              dropdownRender={(menu) => {
                return (
                  <div>
                    {menu}
                    <Divider style={{ margin: '5px 0 4px' }} />
                    <div
                      style={{
                        cursor: 'pointer',
                        padding: '5px 12px',
                      }}
                    >
                      <Input.Search
                        size={'middle'}
                        placeholder={'新增数据表'}
                        enterButton={<PlusOutlined />}
                        value={newValue}
                        onChange={(e) => {
                          setNewValue(e.target.value);
                        }}
                        onSearch={async (value) => {
                          const data = {
                            name: `t_${uid()}`,
                            title: value,
                            fields: [],
                          };
                          field.push(data);
                          setActiveIndex(field.value.length - 1);
                          setOpen(false);
                          setNewValue('');
                          await createOrUpdateCollection(data);
                          await refresh();
                        }}
                      />
                    </div>
                  </div>
                );
              }}
            >
              {field.value?.map((item, index) => {
                return (
                  <Select.Option
                    value={index}
                    label={`${item.title || '未命名'}${
                      item.unsaved ?  ' （未保存）' : ''
                    }`}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      {item.title || '未命名'} {item.unsaved ? '（未保存）' : ''}
                      <DeleteOutlined
                        onClick={async (e) => {
                          e.stopPropagation();
                          field.remove(index);
                          if (field.value?.length === 0) {
                            field.push({
                              name: `t_${uid()}`,
                              unsaved: true,
                              fields: [],
                            });
                          }
                          if (activeIndex === index) {
                            setActiveIndex(0);
                          } else if (activeIndex > index) {
                            setActiveIndex(activeIndex - 1);
                          }
                          if (item.name) {
                            await deleteCollection(item.name);
                            await refresh();
                          }
                        }}
                      />
                    </div>
                  </Select.Option>
                );
              })}
            </Select>
          </div>
        }
        visible={visible}
        onCancel={() => {
          setVisible(false);
        }}
        okText={'保存'}
        cancelText={'关闭'}
        onOk={async () => {
          try {
            form.clearErrors();
            await form.validate(`${field.address.entire}.${activeIndex}.*`);
            delete field.value[activeIndex]['unsaved'];
            await createOrUpdateCollection(field.value[activeIndex]);
            await refresh();
            message.success('保存成功');
          } catch (error) {}
        }}
      >
        {loading ? (
          <Spin />
        ) : (
          <FormLayout layout={'vertical'}>
            <RecursionField
              name={activeIndex}
              schema={
                new Schema({
                  type: 'object',
                  properties: schema.properties,
                })
              }
            />
            {/* <FormConsumer>
            {form => (
              <pre>{JSON.stringify(form.values, null, 2)}</pre>
            )}
          </FormConsumer> */}
          </FormLayout>
        )}
      </Modal>
    </div>
  );
});

export const DatabaseField: any = observer((props) => {
  const field = useField<Formily.Core.Models.ArrayField>();
  useEffect(()=> {
    if (!field.value) {
      field.setValue([]);
    }
  }, [])
  const [activeKey, setActiveKey] = useState(null);
  console.log('DatabaseField', field);
  return (
    <div>
      <Collapse
        activeKey={activeKey}
        onChange={(key) => {
          setActiveKey(key);
        }}
        className={cls({ empty: !field.value?.length })}
        accordion
      >
        {field.value?.map((item, index) => {
          const schema = interfaces.get(item.interface);
          const path = field.address.concat(index);
          const errors = field.form.queryFeedbacks({
            type: 'error',
            address: `*(${path},${path}.*)`,
          });
          return (
            <Collapse.Panel
              header={
                <>
                  {(item.uiSchema && item.uiSchema.title) || (
                    <i style={{ color: 'rgba(0, 0, 0, 0.25)' }}>未命名</i>
                  )}{' '}
                  <Tag>{schema.title}</Tag>
                  <span style={{ color: 'rgba(0, 0, 0, 0.25)', fontSize: 14 }}>
                    {item.name}
                  </span>
                </>
              }
              extra={[
                <Badge count={errors.length} />,
                <DeleteOutlined
                  onClick={(e) => {
                    e.stopPropagation();
                    field.remove(index);
                  }}
                />,
              ]}
              key={item.key}
            >
              <RecursionField
                key={`${item.key}_${index}`}
                name={index}
                schema={
                  new Schema({
                    type: 'object',
                    properties: {
                      layout: {
                        type: 'void',
                        'x-component': 'FormLayout',
                        'x-component-props': {
                          layout: 'vertical',
                          // labelCol: 4,
                          // wrapperCol: 20,
                        },
                        properties: schema.properties,
                      },
                    },
                  })
                }
              />
            </Collapse.Panel>
          );
        })}
      </Collapse>
      <Dropdown
        placement={'bottomCenter'}
        overlayStyle={{
          minWidth: 200,
        }}
        overlay={
          <Menu
            onClick={(info) => {
              const schema = interfaces.get(info.key);
              if (!schema) {
                return;
              }
              const data = {
                ...cloneDeep(schema.default),
                key: uid(),
                name: `f_${uid()}`,
                interface: info.key,
              };
              field.push(data);
              setActiveKey(data.key);
              console.log('info.key', field.value);
            }}
          >
            {options.map((option) => (
              <Menu.ItemGroup title={option.label}>
                {option.children.map((item) => (
                  <Menu.Item key={item.name}>{item.title}</Menu.Item>
                ))}
              </Menu.ItemGroup>
            ))}
          </Menu>
        }
      >
        <Button block type={'dashed'} style={{ marginTop: 10 }}>
          新增
        </Button>
      </Dropdown>
    </div>
  );
});
