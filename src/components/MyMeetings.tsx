import React, { useContext, useEffect, useState } from "react";
import { List, Card, Flex, Divider, Skeleton } from "antd";
import axios from "axios";
import { XFilled, EditOutlined } from "@ant-design/icons";
import SkeletonCards from "./SkeletonCards";
import ModalMeeting from "./ModalMeeting";
import dayjs from "dayjs";
import RoomsContext from "../contexts/RoomsContext";
import { ModalProvider } from "../contexts/ModalContext";
import MainModal from "./Modal/MainModal";
import qs from "qs";

interface MyMeetingsIfc {
  userId: string;
}
interface MeetingsIfc {
  id: number;
  attributes: {
    name: string;
    start: string;
    end: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    description: string;
    room: {
      data: {
        id: number;
        attributes: {
          name: string;
          color: string;
        };
      };
    };
  };
}

const MyMeetings: React.FC<MyMeetingsIfc> = (props) => {
  const { userId } = props;
  const { rooms } = useContext(RoomsContext);

  const [meetings, setMeetings] = useState<MeetingsIfc[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editName, setEditName] = useState("");
  const [editStart, setEditStart] = useState("");
  const [editEnd, setEditEnd] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editRoom, setEditRoom] = useState("");

  const handleModalClose = () => {
    setModalVisible(false);
  };

  const getMeetings: any = async () => {
    const query = qs.stringify({
      filters: {
        $and: [
          { creator: [userId] },
          {
            start: {
              $gt:
                dayjs(Date.now()).format("YYYY-MM-DDTHH:mm:ss").toString() +
                ".000Z",
            },
          },
        ],
      },
      populate: "room",
    });
    console.log("🚀 ~ constgetMeetings:any= ~ query:", query);
    const response = await axios.get(
      `http://192.168.1.125:1337/api/Meetings?${query}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    setMeetings(response.data.data);
    setLoading(false);
  };

  const handleEdit: any = (target: any) => {
    console.log("start " + target.attributes.start);
    console.log(dayjs("2024-04-03T01:00:00.000", "YYYY-MM-DDTHH:mm:ss"));

    console.log(target);
    setEditName(target.attributes.name);
    setEditStart(target.attributes.start);
    setEditEnd(target.attributes.end);
    setEditDescription(target.attributes.description);
    setEditRoom(target.attributes.room.data.attributes.name);
    setModalVisible(true);
  };

  useEffect(() => {
    getMeetings();
  }, []);

  return (
    <Flex vertical>
      <span className="title">Meus Agendamentos</span>
      {modalVisible && (
        // <ModalMeeting
        //   closeModal={hideModal}
        //   modalTitle={"Meu Agendamento"}
        //   editName={editName}
        //   editStart={editStart}
        //   editEnd={editEnd}
        //   editDescription={editDescription}
        //   editRoom={editRoom}
        // />
        <ModalProvider>
          <MainModal edit loading={false} closeModal={handleModalClose} />
        </ModalProvider>
      )}
      <Divider />
      {loading && <SkeletonCards count={9} cardsPerRow={3} />}
      {!loading && (
        <List
          itemLayout="horizontal"
          dataSource={meetings}
          grid={{ gutter: 16, column: 3 }}
          renderItem={(meetingItem) => (
            <Card
              title={meetingItem.attributes.name}
              style={{ maxWidth: "90%", marginBottom: "5%" }}
              // extra={
              //   <div onClick={handleEdit} style={{ cursor: "pointer" }}>
              //     <EditOutlined />
              //     Editar
              //   </div>
              // }
              actions={[
                <EditOutlined
                  key={meetingItem.id}
                  onClick={() => handleEdit(meetingItem)}
                />,
              ]}
            >
              <Flex>
                <XFilled
                  style={{
                    color: `${meetingItem.attributes.room.data.attributes.color}`,
                    marginRight: "10px",
                  }}
                />
                <p style={{ margin: 0 }}>
                  {meetingItem.attributes.room.data.attributes.name}
                </p>
              </Flex>
              <p>
                <b>Data</b>:{" "}
                {dayjs(meetingItem.attributes.start)
                  .format("DD/MM/YYYY")
                  .toString()}
              </p>
              <p>
                <b>Hora de início</b>:{" "}
                {meetingItem.attributes.start.slice(11, 16)}
              </p>
              <p>
                <b>Hora de término</b>:{" "}
                {meetingItem.attributes.end.slice(11, 16)}
              </p>
              <p>
                <b>Descrição</b>: {meetingItem.attributes.description}
              </p>
            </Card>
          )}
        />
      )}
    </Flex>
  );
};

export default MyMeetings;
