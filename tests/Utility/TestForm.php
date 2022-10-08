<?php

declare(strict_types=1);

/*
 * Copyright (c) Adrian Jeledintan
 */

namespace Drjele\Symfony\JsonForm\Test\Utility;

use Drjele\Symfony\JsonForm\Contract\DtoInterface;
use Drjele\Symfony\JsonForm\Element\ArrayElement;
use Drjele\Symfony\JsonForm\Element\AutocompleteElement;
use Drjele\Symfony\JsonForm\Element\BoolElement;
use Drjele\Symfony\JsonForm\Element\CollectionElement;
use Drjele\Symfony\JsonForm\Element\DateElement;
use Drjele\Symfony\JsonForm\Element\FileElement;
use Drjele\Symfony\JsonForm\Element\HiddenElement;
use Drjele\Symfony\JsonForm\Element\LabelElement;
use Drjele\Symfony\JsonForm\Element\NumberElement;
use Drjele\Symfony\JsonForm\Element\PasswordElement;
use Drjele\Symfony\JsonForm\Element\PrototypeCollectionElement;
use Drjele\Symfony\JsonForm\Element\StringElement;
use Drjele\Symfony\JsonForm\Form\Action;
use Drjele\Symfony\JsonForm\Form\Form;
use Drjele\Symfony\JsonForm\Service\AbstractFormService;
use Symfony\Component\HttpFoundation\Request;

class TestForm extends AbstractFormService
{
    protected function getDtoClass(): string
    {
        return TestDto::class;
    }

    protected function getMethod(): string
    {
        return Request::METHOD_GET;
    }

    protected function getAction(DtoInterface $dto): Action
    {
        return new Action('test');
    }

    protected function build(Form $form, DtoInterface $dto): void
    {
        $form->addElement(
            new ArrayElement(
                'array',
                'array label',
                ['test' => 'test'],
                ArrayElement::MODE_SINGLE,
            )
        )
            ->addElement(
                new AutocompleteElement(
                    'autocomplete',
                    'autocomplete label',
                    'autocomplete-route',
                    ArrayElement::MODE_SINGLE
                )
            )
            ->addElement(new BoolElement('bool', 'bool label'))
            ->addElement(
                (new CollectionElement('collection', 'collection label'))
                    ->addElement(new StringElement('string', 'string label'))
            )
            ->addElement(new DateElement('date', 'date label'))
            ->addElement(new FileElement('file', 'file label'))
            ->addElement(new HiddenElement('hidden', 'hidden label'))
            ->addElement(new LabelElement('label', 'label label'))
            ->addElement(new NumberElement('number', 'number label', 1, 10, 1))
            ->addElement(new PasswordElement('password', 'password label'))
            ->addElement(
                (new PrototypeCollectionElement('prototypeCollection', 'prototypeCollection label'))
                    ->addElement(new StringElement('string', 'string label'))
            )
            ->addElement(new StringElement('string', 'string label'));
    }
}
