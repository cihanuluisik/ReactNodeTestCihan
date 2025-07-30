import { useEffect, useState } from 'react';
import { DeleteIcon, ViewIcon, EditIcon } from '@chakra-ui/icons';
import { Button, Menu, MenuButton, MenuItem, MenuList, Text, useDisclosure } from '@chakra-ui/react';
import { getApi, deleteApi } from 'services/api';
import { HasAccess } from '../../../redux/accessUtils';
import CommonCheckTable from '../../../components/reactTable/checktable';
import { SearchIcon } from "@chakra-ui/icons";
import { CiMenuKebab } from 'react-icons/ci';
import { Link, useNavigate } from 'react-router-dom';
import MeetingAdvanceSearch from './components/MeetingAdvanceSearch';
import AddMeeting from './components/Addmeeting';
import EditMeeting from './components/EditMeeting';
import CommonDeleteModel from 'components/commonDeleteModel';
import { deleteManyApi } from 'services/api';
import { toast } from 'react-toastify';
import { fetchMeetingData } from '../../../redux/slices/meetingSlice';
import { useDispatch } from 'react-redux';

const Index = () => {
    const title = "Meeting";
    const navigate = useNavigate()
    const [action, setAction] = useState(false);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();
    const [selectedValues, setSelectedValues] = useState([]);
    const [advanceSearch, setAdvanceSearch] = useState(false);
    const [getTagValuesOutSide, setGetTagValuesOutside] = useState([]);
    const [searchboxOutside, setSearchboxOutside] = useState('');
    const user = JSON.parse(localStorage.getItem("user"));
    const [deleteMany, setDeleteMany] = useState(false);
    const [isLoding, setIsLoding] = useState(false);
    const [data, setData] = useState([]);
    const [displaySearchData, setDisplaySearchData] = useState(false);
    const [searchedData, setSearchedData] = useState([]);
    const [selectedMeeting, setSelectedMeeting] = useState(null);
    const [permission] = HasAccess(['Meetings'])
    const dispatch = useDispatch()


    const actionHeader = {
        Header: "Action", isSortable: false, center: true,
        cell: ({ row }) => (
            <Text fontSize="md" fontWeight="900" textAlign={"center"}>
                <Menu isLazy  >
                    <MenuButton><CiMenuKebab /></MenuButton>
                    <MenuList minW={'fit-content'} transform={"translate(1520px, 173px);"}>

                        {permission?.view && <MenuItem py={2.5} color={'green'}
                            onClick={() => navigate(`/metting/${row?.values._id}`)}
                            icon={<ViewIcon fontSize={15} />}>View</MenuItem>}
                        {permission?.update && <MenuItem py={2.5} color={'blue'}
                            onClick={() => {
                                setSelectedMeeting(row?.values);
                                onEditOpen();
                            }}
                            icon={<EditIcon fontSize={15} />}>Edit</MenuItem>}
                        {permission?.delete && <MenuItem py={2.5} color={'red'} onClick={() => { setDeleteMany(true); setSelectedValues([row?.values?._id]); }} icon={<DeleteIcon fontSize={15} />}>Delete</MenuItem>}
                    </MenuList>
                </Menu>
            </Text>
        )
    }
    const tableColumns = [
        {
            Header: "#",
            accessor: "_id",
            isSortable: false,
            width: 10
        },
        {
            Header: 'Agenda', accessor: 'agenda', cell: (cell) => (
                <Link to={`/metting/${cell?.row?.values._id}`}> <Text
                    me="10px"
                    sx={{ '&:hover': { color: 'blue.500', textDecoration: 'underline' } }}
                    color='brand.600'
                    fontSize="sm"
                    fontWeight="700"
                >
                    {cell?.value || ' - '}
                </Text></Link>)
        },
        { Header: "Date & Time", accessor: "dateTime", },
        { Header: "Time Stamp", accessor: "timestamp", },
        { Header: "Create By", accessor: "createdByName", },
        ...(permission?.update || permission?.view || permission?.delete ? [actionHeader] : [])

    ];

    const fetchData = async () => {
        setIsLoding(true)
        const result = await dispatch(fetchMeetingData())
        if (result.payload.status === 200) {
            setData(result?.payload?.data);
        } else {
            toast.error("Failed to fetch data", "error");
        }
        setIsLoding(false)
    }

    const handleDeleteMeeting = async (ids) => {
        try {
            setIsLoding(true)
            // Delete each meeting individually using the single delete endpoint
            const deletePromises = ids.map(id => deleteApi('api/meeting/delete/', id));
            const responses = await Promise.all(deletePromises);
            
            // Check if all deletions were successful
            const allSuccessful = responses.every(response => response.status === 200);
            
            if (allSuccessful) {
                setSelectedValues([])
                setDeleteMany(false)
                setAction((pre) => !pre)
            } else {
                toast.error("Some meetings could not be deleted", "error");
            }
        } catch (error) {
            console.log(error)
            toast.error("Failed to delete meetings", "error");
        }
        finally {
            setIsLoding(false)
        }
    }

    // const [selectedColumns, setSelectedColumns] = useState([...tableColumns]);
    // const dataColumn = tableColumns?.filter(item => selectedColumns?.find(colum => colum?.Header === item.Header))


    useEffect(() => {
        fetchData();
    }, [action])

    return (
        <div>
            <CommonCheckTable
                title={title}
                isLoding={isLoding}
                columnData={tableColumns ?? []}
                // dataColumn={dataColumn ?? []}
                allData={data ?? []}
                tableData={data}
                searchDisplay={displaySearchData}
                setSearchDisplay={setDisplaySearchData}
                searchedDataOut={searchedData}
                setSearchedDataOut={setSearchedData}
                tableCustomFields={[]}
                access={permission}
                // action={action}
                // setAction={setAction}
                // selectedColumns={selectedColumns}
                // setSelectedColumns={setSelectedColumns}
                // isOpen={isOpen}
                // onClose={onClose}
                onOpen={onOpen}
                selectedValues={selectedValues}
                setSelectedValues={setSelectedValues}
                setDelete={setDeleteMany}
                AdvanceSearch={
                    <Button variant="outline" colorScheme='brand' leftIcon={<SearchIcon />} mt={{ sm: "5px", md: "0" }} size="sm" onClick={() => setAdvanceSearch(true)}>Advance Search</Button>
                }
                getTagValuesOutSide={getTagValuesOutSide}
                searchboxOutside={searchboxOutside}
                setGetTagValuesOutside={setGetTagValuesOutside}
                setSearchboxOutside={setSearchboxOutside}
                handleSearchType="MeetingSearch"
            />

            <MeetingAdvanceSearch
                advanceSearch={advanceSearch}
                setAdvanceSearch={setAdvanceSearch}
                setSearchedData={setSearchedData}
                setDisplaySearchData={setDisplaySearchData}
                allData={data ?? []}
                setAction={setAction}
                setGetTagValues={setGetTagValuesOutside}
                setSearchbox={setSearchboxOutside}
            />
            <AddMeeting setAction={setAction} isOpen={isOpen} onClose={onClose} />
            
            <EditMeeting 
                setAction={setAction} 
                isOpen={isEditOpen} 
                onClose={onEditClose} 
                meetingData={selectedMeeting}
            />

            {/* Delete model */}
            <CommonDeleteModel isOpen={deleteMany} onClose={() => setDeleteMany(false)} type='Meetings' handleDeleteData={handleDeleteMeeting} ids={selectedValues} />
        </div>
    )
}

export default Index