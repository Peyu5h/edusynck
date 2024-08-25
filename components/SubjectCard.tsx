import Image from "next/image";
import { Separator } from "./ui/separator";
import Link from "next/link";

interface classRoomProp {
  id: string;
  name: string;
  classId: string;
  googleClassroomId: string;
  professorName?: string;
  professorProfilePicture?: string;
}

interface SubjectCardProps {
  course: classRoomProp;
}

const SubjectCard: React.FC<SubjectCardProps> = ({ course }) => {
  return (
    <div>
      <Link href={`/classrooms/${course.id}`}>
        <div className="flex h-48 w-full cursor-pointer flex-col rounded-xl border-[1px] border-transparent bg-bground2 p-6 duration-300 hover:border-[1px] hover:border-zinc-700">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-y-1">
              <h1 className="text-xl font-light text-thintext">Professor</h1>
              <p className="text-xl font-thin text-text">
                {course.professorName || "No Name"}
              </p>
            </div>
            <div className="h-14 w-14 overflow-hidden rounded-md">
              <Image
                src={`https:${course.professorProfilePicture}`}
                alt="Professor picture"
                width={56}
                height={56}
                layout="responsive"
              />
            </div>
          </div>
          <Separator className="my-4 h-[0.5px] w-full rounded-xl bg-neutral-700" />
          <div className="flex flex-col gap-y-1">
            <h1 className="mt-4 text-xl font-normal text-thintext">
              {course.name}
            </h1>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default SubjectCard;
