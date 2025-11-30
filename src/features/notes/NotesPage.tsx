import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, TextInput, Textarea, Button, Card, Group, Stack, Title, Loader, Center, Text, ActionIcon, Collapse, Avatar, Box } from '@mantine/core';
import { IconTrash, IconPlus, IconX } from '@tabler/icons-react';
import { useNotes } from '../../hooks/useNotes';
import { useAuth } from '../../hooks/useAuth';

export function NotesPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const { data: notes, isLoading, error, addNote, isAdding, deleteNote, updateNote } = useNotes() as any;

    useEffect(() => {
        console.log('NotesPage - data:', notes);
        console.log('NotesPage - isLoading:', isLoading);
        console.log('NotesPage - error:', error);
    }, [notes, isLoading, error]);

    const handleAdd = async () => {
        if (!title.trim()) return;
        if (editingId) {
            // Update existing note
            updateNote({
                id: editingId,
                data: { title: title.trim(), content: content.trim() }
            });
            setEditingId(null);
        } else {
            // Add new note
            addNote({ title: title.trim(), content: content.trim() });
        }
        setTitle('');
        setContent('');
        setShowForm(false);
    };

    const handleEdit = (noteId: string, noteTitle: string, noteContent: string) => {
        setEditingId(noteId);
        setTitle(noteTitle);
        setContent(noteContent);
        setShowForm(true);
    };

    const handleCancel = () => {
        setTitle('');
        setContent('');
        setShowForm(false);
        setEditingId(null);
    };

    return (
        <Box bg="#f8f9fa" style={{ minHeight: '100vh', paddingBottom: '100px' }}>
            <div style={{
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                padding: '20px 20px 60px',
                color: 'white',
                borderBottomLeftRadius: '10px',
                borderBottomRightRadius: '10px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}>
                <Group justify="space-between" align="center" mb="xl">
                    <div>
                        <Text size="xs" style={{ opacity: 0.8 }}>Notes</Text>
                        <Title order={2} style={{ color: 'white', fontSize: '28px' }} mb="xs">Notes</Title>
                        <Text c="white" style={{ opacity: 0.8 }} size="sm">Keep track of ideas and future improvements</Text>
                    </div>
                    <Group gap="sm">
                        <Avatar
                            src={user?.photoURL}
                            alt={user?.displayName || 'User'}
                            size="md"
                            radius="xl"
                            style={{ cursor: 'pointer' }}
                            onClick={() => navigate('/profile')}
                        >
                            {user?.displayName?.[0] || 'A'}
                        </Avatar>
                    </Group>
                </Group>
            </div>

            <Container size="lg" py="md" style={{ marginTop: '-60px' }}>
                <Stack gap="lg">
                    {/* Add Note Button - Full Width */}
                    <Button
                        fullWidth
                        size="md"
                        leftSection={<IconPlus size={18} />}
                        onClick={() => {
                            setEditingId(null);
                            setTitle('');
                            setContent('');
                            setShowForm(!showForm);
                        }}
                        variant={showForm ? 'filled' : 'light'}
                    >
                        {showForm ? (editingId ? 'Cancel Edit' : 'Cancel') : 'Add New Note'}
                    </Button>

                    {/* Error Display */}
                    {error && (
                        <Card className="glass-card" p="md" style={{ backgroundColor: 'rgba(255, 100, 100, 0.1)' }}>
                            <Text size="sm" c="red">
                                Error: {error?.message || JSON.stringify(error)}
                            </Text>
                        </Card>
                    )}

                    {/* Form - Collapsible */}
                    <Collapse in={showForm}>
                        <Card className="glass-card" p="lg">
                            <Stack>
                                <TextInput
                                    placeholder="Note title"
                                    value={title}
                                    onChange={(e) => setTitle(e.currentTarget.value)}
                                    autoFocus
                                />
                                <Textarea
                                    placeholder="Write your note here..."
                                    value={content}
                                    onChange={(e) => setContent(e.currentTarget.value)}
                                    minRows={4}
                                />
                                <Group justify="flex-end">
                                    <Button variant="light" onClick={handleCancel} leftSection={<IconX size={16} />}>
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleAdd}
                                        loading={isAdding}
                                        leftSection={<IconPlus size={16} />}
                                        disabled={!title.trim()}
                                    >
                                        {editingId ? 'Update Note' : 'Save Note'}
                                    </Button>
                                </Group>
                            </Stack>
                        </Card>
                    </Collapse>

                    {/* Notes List */}
                    {isLoading ? (
                        <Center style={{ height: 200 }}>
                            <Loader />
                        </Center>
                    ) : (
                        <Stack gap="md">
                            {(notes || []).length > 0 ? (
                                (notes || []).map((n: any) => (
                                    <Card key={n.id} className="glass-card" p="lg">
                                        <Group justify="space-between" align="flex-start">
                                            <Stack gap="xs" style={{ flex: 1 }}>
                                                <Text fw={600} size="md">{n.title}</Text>
                                                <Text size="sm" className="muted-text" style={{ whiteSpace: 'pre-wrap' }}>{n.content}</Text>
                                            </Stack>
                                            <Group gap="xs">
                                                <ActionIcon
                                                    color="blue"
                                                    variant="light"
                                                    onClick={() => handleEdit(n.id, n.title, n.content)}
                                                    title="Edit note"
                                                >
                                                    <IconPlus size={18} style={{ transform: 'rotate(45deg)' }} />
                                                </ActionIcon>
                                                <ActionIcon
                                                    color="red"
                                                    variant="light"
                                                    onClick={() => deleteNote(n.id)}
                                                    title="Delete note"
                                                >
                                                    <IconTrash size={18} />
                                                </ActionIcon>
                                            </Group>
                                        </Group>
                                    </Card>
                                ))
                            ) : (
                                <Card className="glass-card" p="lg">
                                    <Text ta="center" className="muted-text">
                                        No notes yet — click "Add New Note" to create one
                                    </Text>
                                </Card>
                            )}
                        </Stack>
                    )}
                </Stack>
            </Container>
        </Box>
    );
}

