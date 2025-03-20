import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import {
  Form,
  Input,
  DatePicker,
  Select,
  Tag,
  message,
  Flex,
  Button,
} from "antd";
import dayjs from "dayjs";
import { XFilled } from "@ant-design/icons";

import RoomsContext from "../../contexts/RoomsContext";
import { ModalContext } from "../../contexts/ModalContext";
import qs from "qs";

const dateFormat = "DD-MM-YYYY";

interface ModalProps {
  closeModal: () => void;
}
interface userDataInterface {
  id: number;
}

const EditMeeting: React.FC<ModalProps> = (props) => {
  const { closeModal } = props;
  const { rooms } = useContext(RoomsContext);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [participants, setParticipants] = useState<string[]>([]);
  const [currentEmail, setCurrentEmail] = useState("");
  const [userData, setUserData] = useState<userDataInterface>({ id: 0 });

  const {
    name,
    changeMeetingName,
    description,
    changeMeetingDescription,
    start,
    changeMeetingStart,
    end,
    changeMeetingEnd,
    roomName,
    changeMeetingRoomName,
    roomColor,
    changeMeetingRoomColor,
    editId,
  } = useContext(ModalContext);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get("http://localhost:1337/api/Users/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setUserData(response.data);
      } catch (error) {
        console.error("Erro ao recuperar os dados do usuário:", error);
      }
    };
    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchMeetingData = async () => {
      const query = qs.stringify({
        populate: ["room", "creator", "participants"],
      });
      try {
        console.log("🚀 ~ fetchMeetingData ~ viewId:", editId);
        const response = await axios.get(
          `http://localhost:1337/api/Meetings/${editId}?${query}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        populateMeetingView(response.data.data.attributes);
      } catch (error) {
        console.error("Erro ao recuperar os dados da reunião:", error);
      }
      fetchParticipants();
    };
    const fetchParticipants = async () => {
      const query = qs.stringify({
        filters: {
          meeting: { id: editId },
        },
      });
      try {
        const response = await axios.get(
          "http://localhost:1337/api/Participants?" + query,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        setParticipants(
          response.data.data.map(
            (participant: { attributes: { email: string } }) =>
              participant.attributes.email
          )
        );
        setLoading(false);
      } catch (error) {
        console.error("Erro ao recuperar os participantes:", error);
      }
    };
    if (editId !== 0) {
      fetchMeetingData();
    }
  }, [editId]);

  const populateMeetingView = (meeting: {
    name: string;
    description: string;
    start: string;
    end: string;
    room: { data: { attributes: { name: string; color: string }; id: number } };
  }) => {
    form.setFieldsValue({
      name: meeting.name,
      description: meeting.description,
      room: meeting.room.data.id,
      startDate: dayjs(meeting.start),
      duration: dayjs(meeting.end).diff(dayjs(meeting.start), "minutes"),
    });
    changeMeetingName(meeting.name);
    changeMeetingDescription(meeting.description);
    changeMeetingStart(formatDate(meeting.start));
    changeMeetingEnd(meeting.end);
  };

  useEffect(() => {
    if (success) {
      message.open({
        type: "success",
        content: "Agendamento Criado com Sucesso!",
        duration: 7,
      });
      setSuccess(false);
      closeModal();
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      message.open({
        type: "error",
        content: "Falha ao Criar Agendamento",
      });
      setError(false);
    }
  }, [error]);

  const addParticipant = () => {
    if (!participants.includes(currentEmail)) {
      setParticipants([...participants, currentEmail]);
      setCurrentEmail("");
    } else {
      setCurrentEmail("");
    }
    console.log(participants);
  };

  const removeParticipant = (notParticipant: any) => {
    setParticipants(participants.filter((pt) => pt !== notParticipant));
  };

  const formatDate = (date: string) => {
    return dayjs(date).format("YYYY-MM-DD HH:mm:ss").toString();
  };

  const getEndDate = (date: string, duration: number) => {
    return formatDate(dayjs(date).add(duration, "minute").toString());
  };

  const handleSubmit = async () => {
    var values = form.getFieldsValue(true);
    setLoading(true);
    setError(false);
    setSuccess(false);
    const final_meeting = {
      name: values.name,
      description: values.description,
      start: formatDate(values.startDate),
      room: values.room,
      creator: userData.id,
      end: getEndDate(values.startDate, values.duration),
    };
    console.log(final_meeting);
    try {
      const response = await axios.post(
        "http://localhost:1337/api/meetings",
        {
          data: final_meeting,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log(response);
      if (participants.length > 0) {
        try {
          participants.forEach(async (participant) => {
            const responseParticipants = await axios.post(
              "http://localhost:1337/api/participants",
              {
                data: {
                  meeting: response.data.data.id,
                  email: participant,
                  confirmed: false,
                },
              },
              {
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            );
            console.log(responseParticipants);
          });
        } catch (error) {}
      }
      setLoading(false);
      setSuccess(true);
    } catch (error) {
      setLoading(false);
      setError(true);
    }
  };

  const [form] = Form.useForm();

  return (
    <>
      <Form
        initialValues={{ remember: true }}
        layout="vertical"
        className="form-modal"
        form={form}
        onFinish={handleSubmit}
      >
        <Form.Item
          name="name"
          label="Nome"
          rules={[
            {
              required: true,
              message: "Insira o nome do agendamento!",
              warningOnly: false,
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Flex gap="large">
          <Form.Item
            name="startDate"
            label="Início"
            rules={[
              {
                required: true,
                message: "Insira a data e hora de início!",
              },
            ]}
          >
            <DatePicker showTime minDate={dayjs(dayjs(), dateFormat)} />
          </Form.Item>
          <Form.Item
            name="duration"
            label="Duração"
            style={{ minWidth: "80px" }}
            rules={[
              { required: true, message: "Selecione o tempo de duração!" },
            ]}
          >
            <Select
              options={[
                { value: 15, label: <span>15 min.</span> },
                { value: 30, label: <span>30 min.</span> },
                { value: 60, label: <span>60 min.</span> },
                { value: 90, label: <span>90 min.</span> },
              ]}
            />
          </Form.Item>
        </Flex>
        <Form.Item
          name="room"
          label="Sala"
          rules={[{ required: true, message: "Selecione a sala!" }]}
        >
          {rooms && (
            <Select
              options={rooms.map((room) => {
                return {
                  value: room.id,
                  label: (
                    <span>
                      <span>
                        <XFilled style={{ color: room.attributes.color }} />
                      </span>
                      {" " + room.attributes.name}
                    </span>
                  ),
                };
              })}
            />
          )}
        </Form.Item>
        <Form.Item label="Descrição" name="description">
          <Input.TextArea autoSize={{ minRows: 2, maxRows: 6 }} />
        </Form.Item>
        <Form.Item label="Participantes" name="participants">
          <Flex>
            <Input
              type="email"
              // value={currentEmail}
              onChange={(e) => {
                setCurrentEmail(e.target.value);
              }}
            />
            <Button onClick={addParticipant}>+</Button>
          </Flex>
        </Form.Item>
        <Form.Item>
          <div style={{ marginTop: 10 }}>
            {participants.map((email, index) => (
              <Tag
                key={index}
                closable
                onClose={() => removeParticipant(email)}
              >
                {email}
              </Tag>
            ))}
          </div>
        </Form.Item>
        <Flex justify={"flex-end"} align={"center"} gap={"small"}>
          <Form.Item>
            <Button disabled={loading} onClick={closeModal}>
              Cancelar
            </Button>
          </Form.Item>
          <Form.Item>
            <Button disabled={loading} type="primary" htmlType="submit">
              Salvar
            </Button>
          </Form.Item>
        </Flex>
      </Form>
    </>
  );
};

export default EditMeeting;
